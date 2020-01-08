#########################
#   Andrew Wang         #
#                       #
#########################

# Utility
import numpy as np
import math
from collections import deque

# Graphing
from mpl_toolkits.mplot3d import axes3d
from matplotlib import pyplot as plt
from matplotlib import cm


def sample_spherical(npoints, radius, ndim=3):
    '''
    source: https://stackoverflow.com/a/33977530
    '''
    vec = np.abs(np.random.randn(ndim, npoints))
    vec /= np.linalg.norm(vec, axis=0)
    vec *= radius
    return vec

def draw_lines(coordinates, adj, ax):
    # ax.plot([0, 1],[0, 1],[0, 1],color = 'g')
    # print(adj)
    for v in adj:
        for n in adj[v]:
            ax.plot([coordinates[v][0],coordinates[n][0]],\
            [coordinates[v][1],coordinates[n][1]],\
            [coordinates[v][2],coordinates[n][2]], color='g')

def set_axes_equal(ax):
    '''
    source: https://stackoverflow.com/a/31364297
    Make axes of 3D plot have equal scale so that spheres appear as spheres,
    cubes as cubes, etc..  This is one possible solution to Matplotlib's
    ax.set_aspect('equal') and ax.axis('equal') not working for 3D.

    Input
      ax: a matplotlib axis, e.g., as output from plt.gca().
    '''

    x_limits = ax.get_xlim3d()
    y_limits = ax.get_ylim3d()
    z_limits = ax.get_zlim3d()

    x_range = abs(x_limits[1] - x_limits[0])
    x_middle = np.mean(x_limits)
    y_range = abs(y_limits[1] - y_limits[0])
    y_middle = np.mean(y_limits)
    z_range = abs(z_limits[1] - z_limits[0])
    z_middle = np.mean(z_limits)

    # The plot bounding box is a sphere in the sense of the infinity
    # norm, hence I call half the max range the plot radius.
    plot_radius = 0.5*max([x_range, y_range, z_range])

    ax.set_xlim3d([x_middle - plot_radius, x_middle + plot_radius])
    ax.set_ylim3d([y_middle - plot_radius, y_middle + plot_radius])
    ax.set_zlim3d([z_middle - plot_radius, z_middle + plot_radius])

def graph(X, Y, Z, coordinates, adj, rev):
    '''
    Visualize coordinates
    '''

    phi = np.linspace(0, np.pi/2, 20)
    theta = np.linspace(0, np.pi/2, 40)
    x = np.outer(np.sin(theta), np.cos(phi))
    y = np.outer(np.sin(theta), np.sin(phi))
    z = np.outer(np.cos(theta), np.ones_like(phi))


    #X, Y, Z = sample_spherical(npoints, radius)
    fig = plt.figure()
    ax = fig.add_subplot(1,1,1,projection='3d')
    #ax = fig.gca(projection='3d')
    ax.set_aspect('equal')
    '''
    for num in range(len(rev)):                            # display level
        ax.plot_wireframe(x*(num+1), y*(num+1), z*(num+1), color='gray', rstride=1, cstride=1)
        #ax.plot_surface(x*(num+1), y*(num+1), z*(num+1),cmap=cm.gray)
    '''
    draw_lines(coordinates, adj, ax)
    # ax.plot([0, 1],[0, 1],[0, 1],color = 'g')
    ax.scatter(X, Y, Z, s=100, c='r', zorder=10)
    set_axes_equal(ax)


def points(adj, length, nodes, radius):
    '''
    takes in:
    -   adj, the adjacency list, where vertices are represented as ints
    -   length, number of vertices
    -   nodes, a list of vertices
    generates the points at each level
    returns three dictionaries, one for 
    '''

    q = deque()
    initial = nodes[0]
    q.append(initial)
    level = [None] * length
    level[initial] = radius                      # initial level must be 1 s.t. radius begins at 1. 
    combined_X = {}
    combined_Y = {}
    combined_Z = {}
    while len(q)>0:
        v = q.popleft()
        e = adj[v]
        l = level[v]
        X, Y, Z = sample_spherical(len(e), l)

        if l not in combined_X:
            combined_X[l] = list(X)
        else:
            combined_X[l].extend(X)

        if l not in combined_Y:
            combined_Y[l] = list(Y)
        else:
            combined_Y[l].extend(Y)

        if l not in combined_Z:
            combined_Z[l] = list(Z)
        else:
            combined_Z[l].extend(Z)

        for neighbor in e:
            q.append(neighbor)
            level[neighbor] = level[v]+1

    # print(level)
    return combined_X, combined_Y, combined_Z, level

def reverse_level(level):
    index = 0
    level_dic = {}
    for l in level:
        if l not in level_dic:
            level_dic[l] = [index]
        else:
            level_dic[l].append(index)
        index+=1
    return level_dic

def distance(a, b):
    '''
    arguments: a, b are 3-D points
    returns: distance between a and b
    '''
    return math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2)

def gen_candidates(points, origin, n=-1):
    '''
    compute all the minimum distance vertices first before checking if there are duplicates
    '''

    # print(n)
    # print(points)
    # print(origin)
    if n < 0:
        return points
    x = {}
    for point in points:
        d = distance(origin, point)
        if d not in x:
            x[d] = [point]
        else:
            x[d].append(point)
    # print(x)
    keys = list(x.keys())
    keys.sort(reverse=True)
    # print(keys)
    num = 0
    index = 0
    coordinates = []
    while num < n:
        #print(num)
        num+=len(x[keys[index]])
        coordinates.extend(x[keys[index]])
        index+=1
    return coordinates

def min_distance(points, origin):
    '''
    given node coordinate and candidate neighbor coordinates, returns closest point
    '''
    min_d_coord = []
    min_d = 1e32
    for point in points:
        d = distance(origin, point)
        if d < min_d:
            min_d = d
            min_d_coord = point
    return d, min_d_coord

def max_distance(points, origin):
    '''
    given node coordinate and candidate neighbor coordinates, returns farthest point
    '''
    max_d_coord = []
    max_d = 0
    for point in points:
        d = distance(origin, point)
        if d > max_d:
            max_d = d
            max_d_coord = point
    return max_d, max_d_coord

def connect(x, y, z, level, adj):
    '''
    IDEA:

    -   Greedy: 

    PSEUDO:

    1)  For each level
    2)      order the nodes of the level by max_distance(...)
    3)      for each node in the ordered nodes
    4)          assign closest point

    NOTES: 
    
    -   if two vertices on different levels share the same neighbor, override 
        the existing level
    -   level matches node (as index) to its corresponding level

    all along the watchtower, princes kept the view. 

    '''
    #print(adj)
    rev = reverse_level(level)
    coordinates = {0: [0, 0, 0]}
    for l in rev.keys():

        ## PREPROCESSING

        points = []                                     # candidate coordinates for next level
        # print(x[l])
        for num in range(len(x[l])):
            point = [x[l][num], y[l][num], z[l][num]]
            points.append(point)
            # print(point)

        ## DETERMINING ORDER

        # print(points)
        ordered = rev[l]                                # nodes in level l
        '''                                               
        for v in ordered:                               # debugging
            print(v)
            print(coordinates[v])
            print(max_distance(points, coordinates[v])[0])
        '''
        ordered = sorted(ordered, key=lambda v: max_distance(points,\
        coordinates[v])[0], reverse=True)                               # list for order
        # print(ordered)

        ## ASSIGN POINT

        # print(nodes)
        for v in ordered:                               # for each ordered node           
            # if v in coordinates:                           
            for neighbor in adj[v]:                     # for each neighbor to ^node
                # print(neighbor, level[neighbor])
                if l+1 == level[neighbor]:                                      # if the level of the neighbor is correct
                    assignment = min_distance(points, coordinates[v])[1]        # min distance assignment
                    points.remove(assignment)
                    if neighbor not in coordinates:                             # neighbor already assigned? (ie shared neighbors)
                        coordinates[neighbor] = assignment
            # print(nodes)   
            # print(matches)   
            # print(candidates)
        # print(matches) 



        #print(l)
        #print(x[l])

    # print(coordinates)
    return coordinates

def gen_coordinates(adj, radius=1):
    nodes = list(adj.keys())
    X, Y, Z, level = points(adj, len(nodes), nodes, radius)
    # print(level)
    rev = reverse_level(level)
    coordinates = connect(X, Y, Z, level, adj)
    return coordinates

def main():
    adj = {
        0:[1, 2],
        1:[3, 4],
        2:[3, 4],
        3:[5],
        4:[6],
        5:[6],
        6:[]
    }
    nodes = list(adj.keys())
    X, Y, Z, level = points(adj, len(nodes), nodes, 1)
    # print(level)
    rev = reverse_level(level)
    coordinates = connect(X, Y, Z, level, adj)

    # verification
    x = []
    y = []
    z = []
    for level in X.keys():
        x.extend(X[level])
        y.extend(Y[level])
        z.extend(Z[level])
    #print(x)
    #print(y)
    #print(z)
    graph(x, y, z, coordinates, adj, rev)
    plt.show()
    

if __name__== "__main__":
    main()