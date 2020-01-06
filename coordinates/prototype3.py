#########################
#   Andrew Wang         #
#                       #
#########################

# Utility
import numpy as np
import math
from collections import deque
import json

# Graphing
from mpl_toolkits.mplot3d import axes3d
from matplotlib import pyplot as plt

json_string = None

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

def graph(X, Y, Z, coordinates, adj, rev, show_level=False):
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
    if show_level:
        keys = rev.keys()
        radius = min(keys)
        for num in range(len(rev)):
            ax.plot_wireframe(x*(num+1)*radius, y*(num+1)*radius, z*(num+1)*radius, color='gray', rstride=1, cstride=1)
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
    #visited = [False] * length
    level[initial] = radius                      # initial level must be 1 s.t. radius begins at 1. 
    #visited[initial] = True
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
            level[neighbor] = level[v]+radius

    # Uncomment for level check:         
    #print(level)
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

    #print(n)
    #print(points)
    #print(origin)
    if n < 0:
        return points
    x = {}
    for point in points:
        d = distance(origin, point)
        if d not in x:
            x[d] = [point]
        else:
            x[d].append(point)
    #print(x)
    keys = list(x.keys())
    keys.sort(reverse=True)
    #print(keys)
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

def connect(x, y, z, level, adj, radius=1):
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
    levels_sorted = rev.keys()
    levels_sorted = sorted(levels_sorted)
    # print(levels_sorted)
    coordinates = {0: [0, 0, 0]}
    for l in levels_sorted:

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
        # to_be_assigned = [] 
        for v in ordered:                               # for each ordered node           
            # if v in coordinates:                           
            for neighbor in adj[v]:                     # for each neighbor to ^node
                # print(neighbor, level[neighbor])
                if l+radius == level[neighbor]:                                      # if the level of the neighbor is correct
                    assignment = min_distance(points, coordinates[v])[1]        # min distance assignment
                    points.remove(assignment)
                    if neighbor not in coordinates:                             # neighbor already assigned? (ie shared neighbors)
                        coordinates[neighbor] = assignment
            # print(nodes)   
            # print(matches)   
            # candidates = gen_candidates(points, coordinates[v], n)
            # print(candidates)
        # print(matches) 



        #print(l)
        #print(x[l])

    # print(coordinates)
    return coordinates

def gen_coordinates(adj_unparsed, radius=5):
    '''
    arguments: json object
    returns: dictionary where each node is mapped to a coordinate
    '''
    adj = adjacency_list(adj_unparsed)
    nodes = list(adj.keys())
    nodes.reverse()
    X, Y, Z, level = points(adj, len(nodes), nodes, radius)
    # print(level)
    rev = reverse_level(level)
    coordinates = connect(X, Y, Z, level, adj, radius)

    obj = json.loads(json_string)
    root = obj['objects'][0]['nodes'][-1]
    for each in obj['objects'][1:]:
        each['coord-xyz'] = coordinates[root-each['_gvid']]

    return obj

def adjacency_list(adj_string):
    global json_string
    # json_string = r'{"name":"%3","directed":true,"strict":false,"compound":"true","newrank":"true","_subgraph_cnt":1,"objects":[{"name":"root","compound":"true","newrank":"true","_gvid":0,"nodes":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88],"edges":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193]},{"_gvid":1,"name":"[root] aws_api_gateway_base_path_mapping.base_path","label":"aws_api_gateway_base_path_mapping.base_path","shape":"box"},{"_gvid":2,"name":"[root] aws_api_gateway_deployment.deployment","label":"aws_api_gateway_deployment.deployment","shape":"box"},{"_gvid":3,"name":"[root] aws_api_gateway_domain_name.urlapi","label":"aws_api_gateway_domain_name.urlapi","shape":"box"},{"_gvid":4,"name":"[root] aws_api_gateway_integration.fetch_integration","label":"aws_api_gateway_integration.fetch_integration","shape":"box"},{"_gvid":5,"name":"[root] aws_api_gateway_integration.generate_integration","label":"aws_api_gateway_integration.generate_integration","shape":"box"},{"_gvid":6,"name":"[root] aws_api_gateway_integration.generate_options_integration","label":"aws_api_gateway_integration.generate_options_integration","shape":"box"},{"_gvid":7,"name":"[root] aws_api_gateway_integration.upload_integration","label":"aws_api_gateway_integration.upload_integration","shape":"box"},{"_gvid":8,"name":"[root] aws_api_gateway_integration.upload_options_integration","label":"aws_api_gateway_integration.upload_options_integration","shape":"box"},{"_gvid":9,"name":"[root] aws_api_gateway_integration_response.fetch_ir_200","label":"aws_api_gateway_integration_response.fetch_ir_200","shape":"box"},{"_gvid":10,"name":"[root] aws_api_gateway_integration_response.generate_ir_400","label":"aws_api_gateway_integration_response.generate_ir_400","shape":"box"},{"_gvid":11,"name":"[root] aws_api_gateway_integration_response.generate_options_integration_response","label":"aws_api_gateway_integration_response.generate_options_integration_response","shape":"box"},{"_gvid":12,"name":"[root] aws_api_gateway_integration_response.upload_ir_400","label":"aws_api_gateway_integration_response.upload_ir_400","shape":"box"},{"_gvid":13,"name":"[root] aws_api_gateway_integration_response.upload_options_integration_response","label":"aws_api_gateway_integration_response.upload_options_integration_response","shape":"box"},{"_gvid":14,"name":"[root] aws_api_gateway_method.fetch","label":"aws_api_gateway_method.fetch","shape":"box"},{"_gvid":15,"name":"[root] aws_api_gateway_method.generate","label":"aws_api_gateway_method.generate","shape":"box"},{"_gvid":16,"name":"[root] aws_api_gateway_method.generate_options","label":"aws_api_gateway_method.generate_options","shape":"box"},{"_gvid":17,"name":"[root] aws_api_gateway_method.upload","label":"aws_api_gateway_method.upload","shape":"box"},{"_gvid":18,"name":"[root] aws_api_gateway_method.upload_options","label":"aws_api_gateway_method.upload_options","shape":"box"},{"_gvid":19,"name":"[root] aws_api_gateway_method_response.fetch_200","label":"aws_api_gateway_method_response.fetch_200","shape":"box"},{"_gvid":20,"name":"[root] aws_api_gateway_method_response.fetch_400","label":"aws_api_gateway_method_response.fetch_400","shape":"box"},{"_gvid":21,"name":"[root] aws_api_gateway_method_response.generate_200","label":"aws_api_gateway_method_response.generate_200","shape":"box"},{"_gvid":22,"name":"[root] aws_api_gateway_method_response.generate_400","label":"aws_api_gateway_method_response.generate_400","shape":"box"},{"_gvid":23,"name":"[root] aws_api_gateway_method_response.generate_401","label":"aws_api_gateway_method_response.generate_401","shape":"box"},{"_gvid":24,"name":"[root] aws_api_gateway_method_response.generate_404","label":"aws_api_gateway_method_response.generate_404","shape":"box"},{"_gvid":25,"name":"[root] aws_api_gateway_method_response.generate_500","label":"aws_api_gateway_method_response.generate_500","shape":"box"},{"_gvid":26,"name":"[root] aws_api_gateway_method_response.generate_options_200","label":"aws_api_gateway_method_response.generate_options_200","shape":"box"},{"_gvid":27,"name":"[root] aws_api_gateway_method_response.upload_200","label":"aws_api_gateway_method_response.upload_200","shape":"box"},{"_gvid":28,"name":"[root] aws_api_gateway_method_response.upload_400","label":"aws_api_gateway_method_response.upload_400","shape":"box"},{"_gvid":29,"name":"[root] aws_api_gateway_method_response.upload_401","label":"aws_api_gateway_method_response.upload_401","shape":"box"},{"_gvid":30,"name":"[root] aws_api_gateway_method_response.upload_500","label":"aws_api_gateway_method_response.upload_500","shape":"box"},{"_gvid":31,"name":"[root] aws_api_gateway_method_response.upload_options_200","label":"aws_api_gateway_method_response.upload_options_200","shape":"box"},{"_gvid":32,"name":"[root] aws_api_gateway_request_validator.fetch_validator","label":"aws_api_gateway_request_validator.fetch_validator","shape":"box"},{"_gvid":33,"name":"[root] aws_api_gateway_request_validator.generate_validator","label":"aws_api_gateway_request_validator.generate_validator","shape":"box"},{"_gvid":34,"name":"[root] aws_api_gateway_resource.fetch_resource","label":"aws_api_gateway_resource.fetch_resource","shape":"box"},{"_gvid":35,"name":"[root] aws_api_gateway_resource.generate_resource","label":"aws_api_gateway_resource.generate_resource","shape":"box"},{"_gvid":36,"name":"[root] aws_api_gateway_resource.upload_resource","label":"aws_api_gateway_resource.upload_resource","shape":"box"},{"_gvid":37,"name":"[root] aws_api_gateway_rest_api.api","label":"aws_api_gateway_rest_api.api","shape":"box"},{"_gvid":38,"name":"[root] aws_cloudwatch_event_rule.everyday","label":"aws_cloudwatch_event_rule.everyday","shape":"box"},{"_gvid":39,"name":"[root] aws_cloudwatch_event_target.clean_up_urls_everyday","label":"aws_cloudwatch_event_target.clean_up_urls_everyday","shape":"box"},{"_gvid":40,"name":"[root] aws_iam_policy.invoke","label":"aws_iam_policy.invoke","shape":"box"},{"_gvid":41,"name":"[root] aws_iam_policy.ip","label":"aws_iam_policy.ip","shape":"box"},{"_gvid":42,"name":"[root] aws_iam_policy.ip_put","label":"aws_iam_policy.ip_put","shape":"box"},{"_gvid":43,"name":"[root] aws_iam_policy.lambda_fetch_s3","label":"aws_iam_policy.lambda_fetch_s3","shape":"box"},{"_gvid":44,"name":"[root] aws_iam_role.lambda_fetch_object_role","label":"aws_iam_role.lambda_fetch_object_role","shape":"box"},{"_gvid":45,"name":"[root] aws_iam_role.lambda_generate_url_helper_role","label":"aws_iam_role.lambda_generate_url_helper_role","shape":"box"},{"_gvid":46,"name":"[root] aws_iam_role.lambda_generate_url_role","label":"aws_iam_role.lambda_generate_url_role","shape":"box"},{"_gvid":47,"name":"[root] aws_iam_role.lambda_remove_urls_role","label":"aws_iam_role.lambda_remove_urls_role","shape":"box"},{"_gvid":48,"name":"[root] aws_iam_role.lambda_upload_url_role","label":"aws_iam_role.lambda_upload_url_role","shape":"box"},{"_gvid":49,"name":"[root] aws_iam_role_policy_attachment.invokehelper_gen","label":"aws_iam_role_policy_attachment.invokehelper_gen","shape":"box"},{"_gvid":50,"name":"[root] aws_iam_role_policy_attachment.invokehelper_remove","label":"aws_iam_role_policy_attachment.invokehelper_remove","shape":"box"},{"_gvid":51,"name":"[root] aws_iam_role_policy_attachment.lambdabasic_fetch","label":"aws_iam_role_policy_attachment.lambdabasic_fetch","shape":"box"},{"_gvid":52,"name":"[root] aws_iam_role_policy_attachment.lambdabasic_gen","label":"aws_iam_role_policy_attachment.lambdabasic_gen","shape":"box"},{"_gvid":53,"name":"[root] aws_iam_role_policy_attachment.lambdabasic_genhelp","label":"aws_iam_role_policy_attachment.lambdabasic_genhelp","shape":"box"},{"_gvid":54,"name":"[root] aws_iam_role_policy_attachment.s3full_gen","label":"aws_iam_role_policy_attachment.s3full_gen","shape":"box"},{"_gvid":55,"name":"[root] aws_iam_role_policy_attachment.s3full_remove","label":"aws_iam_role_policy_attachment.s3full_remove","shape":"box"},{"_gvid":56,"name":"[root] aws_iam_role_policy_attachment.s3ip_genhelp","label":"aws_iam_role_policy_attachment.s3ip_genhelp","shape":"box"},{"_gvid":57,"name":"[root] aws_iam_role_policy_attachment.s3ip_upload","label":"aws_iam_role_policy_attachment.s3ip_upload","shape":"box"},{"_gvid":58,"name":"[root] aws_iam_role_policy_attachment.s3read_fetch","label":"aws_iam_role_policy_attachment.s3read_fetch","shape":"box"},{"_gvid":59,"name":"[root] aws_lambda_function.fetch","label":"aws_lambda_function.fetch","shape":"box"},{"_gvid":60,"name":"[root] aws_lambda_function.gen","label":"aws_lambda_function.gen","shape":"box"},{"_gvid":61,"name":"[root] aws_lambda_function.genhelp","label":"aws_lambda_function.genhelp","shape":"box"},{"_gvid":62,"name":"[root] aws_lambda_function.remove","label":"aws_lambda_function.remove","shape":"box"},{"_gvid":63,"name":"[root] aws_lambda_function.upload","label":"aws_lambda_function.upload","shape":"box"},{"_gvid":64,"name":"[root] aws_lambda_permission.allow_cloudwatch_to_call_check_foo","label":"aws_lambda_permission.allow_cloudwatch_to_call_check_foo","shape":"box"},{"_gvid":65,"name":"[root] aws_lambda_permission.apigw_fetch_lambda","label":"aws_lambda_permission.apigw_fetch_lambda","shape":"box"},{"_gvid":66,"name":"[root] aws_lambda_permission.apigw_generate_lambda","label":"aws_lambda_permission.apigw_generate_lambda","shape":"box"},{"_gvid":67,"name":"[root] aws_lambda_permission.apigw_upload_lambda","label":"aws_lambda_permission.apigw_upload_lambda","shape":"box"},{"_gvid":68,"name":"[root] aws_route53_record.route","label":"aws_route53_record.route","shape":"box"},{"_gvid":69,"name":"[root] aws_route53_zone.primary","label":"aws_route53_zone.primary","shape":"box"},{"_gvid":70,"name":"[root] aws_s3_bucket.download_bucket","label":"aws_s3_bucket.download_bucket","shape":"box"},{"_gvid":71,"name":"[root] aws_s3_bucket.upload_bucket","label":"aws_s3_bucket.upload_bucket","shape":"box"},{"_gvid":72,"name":"[root] aws_s3_bucket_public_access_block.private_download_bucket","label":"aws_s3_bucket_public_access_block.private_download_bucket","shape":"box"},{"_gvid":73,"name":"[root] aws_s3_bucket_public_access_block.private_upload_bucket","label":"aws_s3_bucket_public_access_block.private_upload_bucket","shape":"box"},{"_gvid":74,"name":"[root] data.archive_file.fetch_object_code","label":"data.archive_file.fetch_object_code","shape":"box"},{"_gvid":75,"name":"[root] data.archive_file.generate_url_helper_code","label":"data.archive_file.generate_url_helper_code","shape":"box"},{"_gvid":76,"name":"[root] data.archive_file.generate_url_main_code","label":"data.archive_file.generate_url_main_code","shape":"box"},{"_gvid":77,"name":"[root] data.archive_file.remove_expired_urls_code","label":"data.archive_file.remove_expired_urls_code","shape":"box"},{"_gvid":78,"name":"[root] data.archive_file.upload_url_code","label":"data.archive_file.upload_url_code","shape":"box"},{"_gvid":79,"name":"[root] data.aws_acm_certificate.cert","label":"data.aws_acm_certificate.cert","shape":"box"},{"_gvid":80,"name":"[root] null_resource.build_image","label":"null_resource.build_image","shape":"box"},{"_gvid":81,"name":"[root] provider.archive","label":"provider.archive","shape":"diamond"},{"_gvid":82,"name":"[root] provider.aws","label":"provider.aws","shape":"diamond"},{"_gvid":83,"name":"[root] meta.count-boundary (EachMode fixup)","label":"\\N"},{"_gvid":84,"name":"[root] provider.archive (close)","label":"\\N"},{"_gvid":85,"name":"[root] provider.aws (close)","label":"\\N"},{"_gvid":86,"name":"[root] provider.null (close)","label":"\\N"},{"_gvid":87,"name":"[root] provisioner.local-exec (close)","label":"\\N"},{"_gvid":88,"name":"[root] root","label":"\\N"}],"edges":[{"_gvid":0,"tail":1,"head":2},{"_gvid":1,"tail":1,"head":3},{"_gvid":2,"tail":2,"head":4},{"_gvid":3,"tail":2,"head":5},{"_gvid":4,"tail":2,"head":7},{"_gvid":5,"tail":3,"head":79},{"_gvid":6,"tail":4,"head":14},{"_gvid":7,"tail":4,"head":59},{"_gvid":8,"tail":5,"head":15},{"_gvid":9,"tail":5,"head":60},{"_gvid":10,"tail":6,"head":16},{"_gvid":11,"tail":7,"head":17},{"_gvid":12,"tail":7,"head":63},{"_gvid":13,"tail":8,"head":18},{"_gvid":14,"tail":9,"head":4},{"_gvid":15,"tail":9,"head":19},{"_gvid":16,"tail":10,"head":22},{"_gvid":17,"tail":10,"head":70},{"_gvid":18,"tail":11,"head":26},{"_gvid":19,"tail":11,"head":70},{"_gvid":20,"tail":12,"head":28},{"_gvid":21,"tail":12,"head":71},{"_gvid":22,"tail":13,"head":31},{"_gvid":23,"tail":13,"head":71},{"_gvid":24,"tail":14,"head":32},{"_gvid":25,"tail":14,"head":34},{"_gvid":26,"tail":15,"head":33},{"_gvid":27,"tail":15,"head":35},{"_gvid":28,"tail":16,"head":35},{"_gvid":29,"tail":17,"head":36},{"_gvid":30,"tail":18,"head":36},{"_gvid":31,"tail":19,"head":14},{"_gvid":32,"tail":20,"head":14},{"_gvid":33,"tail":21,"head":15},{"_gvid":34,"tail":22,"head":15},{"_gvid":35,"tail":23,"head":15},{"_gvid":36,"tail":24,"head":15},{"_gvid":37,"tail":25,"head":15},{"_gvid":38,"tail":26,"head":16},{"_gvid":39,"tail":27,"head":17},{"_gvid":40,"tail":28,"head":17},{"_gvid":41,"tail":29,"head":17},{"_gvid":42,"tail":30,"head":17},{"_gvid":43,"tail":31,"head":18},{"_gvid":44,"tail":32,"head":37},{"_gvid":45,"tail":33,"head":37},{"_gvid":46,"tail":34,"head":37},{"_gvid":47,"tail":35,"head":37},{"_gvid":48,"tail":36,"head":37},{"_gvid":49,"tail":37,"head":82},{"_gvid":50,"tail":38,"head":82},{"_gvid":51,"tail":39,"head":38},{"_gvid":52,"tail":39,"head":62},{"_gvid":53,"tail":40,"head":61},{"_gvid":54,"tail":41,"head":82},{"_gvid":55,"tail":42,"head":82},{"_gvid":56,"tail":43,"head":82},{"_gvid":57,"tail":44,"head":82},{"_gvid":58,"tail":45,"head":82},{"_gvid":59,"tail":46,"head":82},{"_gvid":60,"tail":47,"head":82},{"_gvid":61,"tail":48,"head":82},{"_gvid":62,"tail":49,"head":40},{"_gvid":63,"tail":49,"head":46},{"_gvid":64,"tail":50,"head":40},{"_gvid":65,"tail":50,"head":47},{"_gvid":66,"tail":51,"head":44},{"_gvid":67,"tail":52,"head":46},{"_gvid":68,"tail":53,"head":45},{"_gvid":69,"tail":54,"head":46},{"_gvid":70,"tail":55,"head":47},{"_gvid":71,"tail":56,"head":41},{"_gvid":72,"tail":56,"head":45},{"_gvid":73,"tail":57,"head":42},{"_gvid":74,"tail":57,"head":48},{"_gvid":75,"tail":58,"head":43},{"_gvid":76,"tail":58,"head":44},{"_gvid":77,"tail":59,"head":44},{"_gvid":78,"tail":59,"head":70},{"_gvid":79,"tail":59,"head":74},{"_gvid":80,"tail":60,"head":46},{"_gvid":81,"tail":60,"head":70},{"_gvid":82,"tail":60,"head":76},{"_gvid":83,"tail":61,"head":45},{"_gvid":84,"tail":61,"head":75},{"_gvid":85,"tail":62,"head":47},{"_gvid":86,"tail":62,"head":70},{"_gvid":87,"tail":62,"head":77},{"_gvid":88,"tail":63,"head":48},{"_gvid":89,"tail":63,"head":71},{"_gvid":90,"tail":63,"head":78},{"_gvid":91,"tail":64,"head":38},{"_gvid":92,"tail":64,"head":62},{"_gvid":93,"tail":65,"head":14},{"_gvid":94,"tail":65,"head":59},{"_gvid":95,"tail":66,"head":15},{"_gvid":96,"tail":66,"head":60},{"_gvid":97,"tail":67,"head":17},{"_gvid":98,"tail":67,"head":63},{"_gvid":99,"tail":68,"head":3},{"_gvid":100,"tail":68,"head":69},{"_gvid":101,"tail":69,"head":82},{"_gvid":102,"tail":70,"head":82},{"_gvid":103,"tail":71,"head":70},{"_gvid":104,"tail":72,"head":70},{"_gvid":105,"tail":73,"head":71},{"_gvid":106,"tail":74,"head":81},{"_gvid":107,"tail":75,"head":81},{"_gvid":108,"tail":76,"head":81},{"_gvid":109,"tail":77,"head":81},{"_gvid":110,"tail":78,"head":81},{"_gvid":111,"tail":79,"head":82},{"_gvid":112,"tail":80,"head":71},{"_gvid":113,"tail":83,"head":1},{"_gvid":114,"tail":83,"head":6},{"_gvid":115,"tail":83,"head":8},{"_gvid":116,"tail":83,"head":9},{"_gvid":117,"tail":83,"head":10},{"_gvid":118,"tail":83,"head":11},{"_gvid":119,"tail":83,"head":12},{"_gvid":120,"tail":83,"head":13},{"_gvid":121,"tail":83,"head":20},{"_gvid":122,"tail":83,"head":21},{"_gvid":123,"tail":83,"head":23},{"_gvid":124,"tail":83,"head":24},{"_gvid":125,"tail":83,"head":25},{"_gvid":126,"tail":83,"head":27},{"_gvid":127,"tail":83,"head":29},{"_gvid":128,"tail":83,"head":30},{"_gvid":129,"tail":83,"head":39},{"_gvid":130,"tail":83,"head":49},{"_gvid":131,"tail":83,"head":50},{"_gvid":132,"tail":83,"head":51},{"_gvid":133,"tail":83,"head":52},{"_gvid":134,"tail":83,"head":53},{"_gvid":135,"tail":83,"head":54},{"_gvid":136,"tail":83,"head":55},{"_gvid":137,"tail":83,"head":56},{"_gvid":138,"tail":83,"head":57},{"_gvid":139,"tail":83,"head":58},{"_gvid":140,"tail":83,"head":64},{"_gvid":141,"tail":83,"head":65},{"_gvid":142,"tail":83,"head":66},{"_gvid":143,"tail":83,"head":67},{"_gvid":144,"tail":83,"head":68},{"_gvid":145,"tail":83,"head":72},{"_gvid":146,"tail":83,"head":73},{"_gvid":147,"tail":83,"head":80},{"_gvid":148,"tail":84,"head":74},{"_gvid":149,"tail":84,"head":75},{"_gvid":150,"tail":84,"head":76},{"_gvid":151,"tail":84,"head":77},{"_gvid":152,"tail":84,"head":78},{"_gvid":153,"tail":85,"head":1},{"_gvid":154,"tail":85,"head":6},{"_gvid":155,"tail":85,"head":8},{"_gvid":156,"tail":85,"head":9},{"_gvid":157,"tail":85,"head":10},{"_gvid":158,"tail":85,"head":11},{"_gvid":159,"tail":85,"head":12},{"_gvid":160,"tail":85,"head":13},{"_gvid":161,"tail":85,"head":20},{"_gvid":162,"tail":85,"head":21},{"_gvid":163,"tail":85,"head":23},{"_gvid":164,"tail":85,"head":24},{"_gvid":165,"tail":85,"head":25},{"_gvid":166,"tail":85,"head":27},{"_gvid":167,"tail":85,"head":29},{"_gvid":168,"tail":85,"head":30},{"_gvid":169,"tail":85,"head":39},{"_gvid":170,"tail":85,"head":49},{"_gvid":171,"tail":85,"head":50},{"_gvid":172,"tail":85,"head":51},{"_gvid":173,"tail":85,"head":52},{"_gvid":174,"tail":85,"head":53},{"_gvid":175,"tail":85,"head":54},{"_gvid":176,"tail":85,"head":55},{"_gvid":177,"tail":85,"head":56},{"_gvid":178,"tail":85,"head":57},{"_gvid":179,"tail":85,"head":58},{"_gvid":180,"tail":85,"head":64},{"_gvid":181,"tail":85,"head":65},{"_gvid":182,"tail":85,"head":66},{"_gvid":183,"tail":85,"head":67},{"_gvid":184,"tail":85,"head":68},{"_gvid":185,"tail":85,"head":72},{"_gvid":186,"tail":85,"head":73},{"_gvid":187,"tail":86,"head":80},{"_gvid":188,"tail":87,"head":80},{"_gvid":189,"tail":88,"head":83},{"_gvid":190,"tail":88,"head":84},{"_gvid":191,"tail":88,"head":85},{"_gvid":192,"tail":88,"head":86},{"_gvid":193,"tail":88,"head":87}]}'
    json_string = adj_string # r'{"name":"%3","directed":true,"strict":false,"compound":"true","newrank":"true","_subgraph_cnt":1,"objects":[{"name":"root","compound":"true","newrank":"true","_gvid":0,"nodes":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33],"edges":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57]},{"_gvid":1,"name":"[root] aws_alb.main","label":"aws_alb.main","shape":"box"},{"_gvid":2,"name":"[root] aws_alb_listener.front_end","label":"aws_alb_listener.front_end","shape":"box"},{"_gvid":3,"name":"[root] aws_alb_target_group.test","label":"aws_alb_target_group.test","shape":"box"},{"_gvid":4,"name":"[root] aws_autoscaling_group.app","label":"aws_autoscaling_group.app","shape":"box"},{"_gvid":5,"name":"[root] aws_cloudwatch_log_group.app","label":"aws_cloudwatch_log_group.app","shape":"box"},{"_gvid":6,"name":"[root] aws_cloudwatch_log_group.ecs","label":"aws_cloudwatch_log_group.ecs","shape":"box"},{"_gvid":7,"name":"[root] aws_ecs_cluster.main","label":"aws_ecs_cluster.main","shape":"box"},{"_gvid":8,"name":"[root] aws_ecs_service.test","label":"aws_ecs_service.test","shape":"box"},{"_gvid":9,"name":"[root] aws_ecs_task_definition.ghost","label":"aws_ecs_task_definition.ghost","shape":"box"},{"_gvid":10,"name":"[root] aws_iam_instance_profile.app","label":"aws_iam_instance_profile.app","shape":"box"},{"_gvid":11,"name":"[root] aws_iam_role.app_instance","label":"aws_iam_role.app_instance","shape":"box"},{"_gvid":12,"name":"[root] aws_iam_role.ecs_service","label":"aws_iam_role.ecs_service","shape":"box"},{"_gvid":13,"name":"[root] aws_iam_role_policy.ecs_service","label":"aws_iam_role_policy.ecs_service","shape":"box"},{"_gvid":14,"name":"[root] aws_iam_role_policy.instance","label":"aws_iam_role_policy.instance","shape":"box"},{"_gvid":15,"name":"[root] aws_internet_gateway.gw","label":"aws_internet_gateway.gw","shape":"box"},{"_gvid":16,"name":"[root] aws_launch_configuration.app","label":"aws_launch_configuration.app","shape":"box"},{"_gvid":17,"name":"[root] aws_route_table.r","label":"aws_route_table.r","shape":"box"},{"_gvid":18,"name":"[root] aws_route_table_association.a","label":"aws_route_table_association.a","shape":"box"},{"_gvid":19,"name":"[root] aws_security_group.instance_sg","label":"aws_security_group.instance_sg","shape":"box"},{"_gvid":20,"name":"[root] aws_security_group.lb_sg","label":"aws_security_group.lb_sg","shape":"box"},{"_gvid":21,"name":"[root] aws_subnet.main","label":"aws_subnet.main","shape":"box"},{"_gvid":22,"name":"[root] aws_vpc.main","label":"aws_vpc.main","shape":"box"},{"_gvid":23,"name":"[root] data.aws_ami.stable_coreos","label":"data.aws_ami.stable_coreos","shape":"box"},{"_gvid":24,"name":"[root] data.aws_availability_zones.available","label":"data.aws_availability_zones.available","shape":"box"},{"_gvid":25,"name":"[root] data.template_file.cloud_config","label":"data.template_file.cloud_config","shape":"box"},{"_gvid":26,"name":"[root] data.template_file.instance_profile","label":"data.template_file.instance_profile","shape":"box"},{"_gvid":27,"name":"[root] data.template_file.task_definition","label":"data.template_file.task_definition","shape":"box"},{"_gvid":28,"name":"[root] provider.aws","label":"provider.aws","shape":"diamond"},{"_gvid":29,"name":"[root] provider.template","label":"provider.template","shape":"diamond"},{"_gvid":30,"name":"[root] meta.count-boundary (EachMode fixup)","label":"\\N"},{"_gvid":31,"name":"[root] provider.aws (close)","label":"\\N"},{"_gvid":32,"name":"[root] provider.template (close)","label":"\\N"},{"_gvid":33,"name":"[root] root","label":"\\N"}],"edges":[{"_gvid":0,"tail":1,"head":20},{"_gvid":1,"tail":1,"head":21},{"_gvid":2,"tail":2,"head":1},{"_gvid":3,"tail":2,"head":3},{"_gvid":4,"tail":3,"head":22},{"_gvid":5,"tail":4,"head":16},{"_gvid":6,"tail":4,"head":21},{"_gvid":7,"tail":5,"head":28},{"_gvid":8,"tail":6,"head":28},{"_gvid":9,"tail":7,"head":28},{"_gvid":10,"tail":8,"head":2},{"_gvid":11,"tail":8,"head":7},{"_gvid":12,"tail":8,"head":9},{"_gvid":13,"tail":8,"head":13},{"_gvid":14,"tail":9,"head":27},{"_gvid":15,"tail":9,"head":28},{"_gvid":16,"tail":10,"head":11},{"_gvid":17,"tail":11,"head":28},{"_gvid":18,"tail":12,"head":28},{"_gvid":19,"tail":13,"head":12},{"_gvid":20,"tail":14,"head":11},{"_gvid":21,"tail":14,"head":26},{"_gvid":22,"tail":15,"head":22},{"_gvid":23,"tail":16,"head":10},{"_gvid":24,"tail":16,"head":19},{"_gvid":25,"tail":16,"head":23},{"_gvid":26,"tail":16,"head":25},{"_gvid":27,"tail":17,"head":15},{"_gvid":28,"tail":18,"head":17},{"_gvid":29,"tail":18,"head":21},{"_gvid":30,"tail":19,"head":20},{"_gvid":31,"tail":20,"head":22},{"_gvid":32,"tail":21,"head":22},{"_gvid":33,"tail":21,"head":24},{"_gvid":34,"tail":22,"head":28},{"_gvid":35,"tail":23,"head":28},{"_gvid":36,"tail":24,"head":28},{"_gvid":37,"tail":25,"head":29},{"_gvid":38,"tail":26,"head":29},{"_gvid":39,"tail":27,"head":29},{"_gvid":40,"tail":30,"head":4},{"_gvid":41,"tail":30,"head":5},{"_gvid":42,"tail":30,"head":6},{"_gvid":43,"tail":30,"head":8},{"_gvid":44,"tail":30,"head":14},{"_gvid":45,"tail":30,"head":18},{"_gvid":46,"tail":31,"head":4},{"_gvid":47,"tail":31,"head":5},{"_gvid":48,"tail":31,"head":6},{"_gvid":49,"tail":31,"head":8},{"_gvid":50,"tail":31,"head":14},{"_gvid":51,"tail":31,"head":18},{"_gvid":52,"tail":32,"head":25},{"_gvid":53,"tail":32,"head":26},{"_gvid":54,"tail":32,"head":27},{"_gvid":55,"tail":33,"head":30},{"_gvid":56,"tail":33,"head":31},{"_gvid":57,"tail":33,"head":32}]}'
    
    obj = json.loads(json_string)
    root = obj['objects'][0]['nodes'][-1]

    adj = {(root-i):[] for i in obj['objects'][0]['nodes']}

    for edge in obj['edges']:
        adj[root-edge['tail']].insert(0, root-edge['head'])

    return adj

def main():
    '''
    adj = {
        0:[1, 2],
        1:[3, 4],
        2:[3, 4],
        3:[5],
        4:[6],
        5:[6],
        6:[]
    }
    '''
    global json_string
    json_string = r'{"name":"%3","directed":true,"strict":false,"compound":"true","newrank":"true","_subgraph_cnt":1,"objects":[{"name":"root","compound":"true","newrank":"true","_gvid":0,"nodes":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88],"edges":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193]},{"_gvid":1,"name":"[root] aws_api_gateway_base_path_mapping.base_path","label":"aws_api_gateway_base_path_mapping.base_path","shape":"box"},{"_gvid":2,"name":"[root] aws_api_gateway_deployment.deployment","label":"aws_api_gateway_deployment.deployment","shape":"box"},{"_gvid":3,"name":"[root] aws_api_gateway_domain_name.urlapi","label":"aws_api_gateway_domain_name.urlapi","shape":"box"},{"_gvid":4,"name":"[root] aws_api_gateway_integration.fetch_integration","label":"aws_api_gateway_integration.fetch_integration","shape":"box"},{"_gvid":5,"name":"[root] aws_api_gateway_integration.generate_integration","label":"aws_api_gateway_integration.generate_integration","shape":"box"},{"_gvid":6,"name":"[root] aws_api_gateway_integration.generate_options_integration","label":"aws_api_gateway_integration.generate_options_integration","shape":"box"},{"_gvid":7,"name":"[root] aws_api_gateway_integration.upload_integration","label":"aws_api_gateway_integration.upload_integration","shape":"box"},{"_gvid":8,"name":"[root] aws_api_gateway_integration.upload_options_integration","label":"aws_api_gateway_integration.upload_options_integration","shape":"box"},{"_gvid":9,"name":"[root] aws_api_gateway_integration_response.fetch_ir_200","label":"aws_api_gateway_integration_response.fetch_ir_200","shape":"box"},{"_gvid":10,"name":"[root] aws_api_gateway_integration_response.generate_ir_400","label":"aws_api_gateway_integration_response.generate_ir_400","shape":"box"},{"_gvid":11,"name":"[root] aws_api_gateway_integration_response.generate_options_integration_response","label":"aws_api_gateway_integration_response.generate_options_integration_response","shape":"box"},{"_gvid":12,"name":"[root] aws_api_gateway_integration_response.upload_ir_400","label":"aws_api_gateway_integration_response.upload_ir_400","shape":"box"},{"_gvid":13,"name":"[root] aws_api_gateway_integration_response.upload_options_integration_response","label":"aws_api_gateway_integration_response.upload_options_integration_response","shape":"box"},{"_gvid":14,"name":"[root] aws_api_gateway_method.fetch","label":"aws_api_gateway_method.fetch","shape":"box"},{"_gvid":15,"name":"[root] aws_api_gateway_method.generate","label":"aws_api_gateway_method.generate","shape":"box"},{"_gvid":16,"name":"[root] aws_api_gateway_method.generate_options","label":"aws_api_gateway_method.generate_options","shape":"box"},{"_gvid":17,"name":"[root] aws_api_gateway_method.upload","label":"aws_api_gateway_method.upload","shape":"box"},{"_gvid":18,"name":"[root] aws_api_gateway_method.upload_options","label":"aws_api_gateway_method.upload_options","shape":"box"},{"_gvid":19,"name":"[root] aws_api_gateway_method_response.fetch_200","label":"aws_api_gateway_method_response.fetch_200","shape":"box"},{"_gvid":20,"name":"[root] aws_api_gateway_method_response.fetch_400","label":"aws_api_gateway_method_response.fetch_400","shape":"box"},{"_gvid":21,"name":"[root] aws_api_gateway_method_response.generate_200","label":"aws_api_gateway_method_response.generate_200","shape":"box"},{"_gvid":22,"name":"[root] aws_api_gateway_method_response.generate_400","label":"aws_api_gateway_method_response.generate_400","shape":"box"},{"_gvid":23,"name":"[root] aws_api_gateway_method_response.generate_401","label":"aws_api_gateway_method_response.generate_401","shape":"box"},{"_gvid":24,"name":"[root] aws_api_gateway_method_response.generate_404","label":"aws_api_gateway_method_response.generate_404","shape":"box"},{"_gvid":25,"name":"[root] aws_api_gateway_method_response.generate_500","label":"aws_api_gateway_method_response.generate_500","shape":"box"},{"_gvid":26,"name":"[root] aws_api_gateway_method_response.generate_options_200","label":"aws_api_gateway_method_response.generate_options_200","shape":"box"},{"_gvid":27,"name":"[root] aws_api_gateway_method_response.upload_200","label":"aws_api_gateway_method_response.upload_200","shape":"box"},{"_gvid":28,"name":"[root] aws_api_gateway_method_response.upload_400","label":"aws_api_gateway_method_response.upload_400","shape":"box"},{"_gvid":29,"name":"[root] aws_api_gateway_method_response.upload_401","label":"aws_api_gateway_method_response.upload_401","shape":"box"},{"_gvid":30,"name":"[root] aws_api_gateway_method_response.upload_500","label":"aws_api_gateway_method_response.upload_500","shape":"box"},{"_gvid":31,"name":"[root] aws_api_gateway_method_response.upload_options_200","label":"aws_api_gateway_method_response.upload_options_200","shape":"box"},{"_gvid":32,"name":"[root] aws_api_gateway_request_validator.fetch_validator","label":"aws_api_gateway_request_validator.fetch_validator","shape":"box"},{"_gvid":33,"name":"[root] aws_api_gateway_request_validator.generate_validator","label":"aws_api_gateway_request_validator.generate_validator","shape":"box"},{"_gvid":34,"name":"[root] aws_api_gateway_resource.fetch_resource","label":"aws_api_gateway_resource.fetch_resource","shape":"box"},{"_gvid":35,"name":"[root] aws_api_gateway_resource.generate_resource","label":"aws_api_gateway_resource.generate_resource","shape":"box"},{"_gvid":36,"name":"[root] aws_api_gateway_resource.upload_resource","label":"aws_api_gateway_resource.upload_resource","shape":"box"},{"_gvid":37,"name":"[root] aws_api_gateway_rest_api.api","label":"aws_api_gateway_rest_api.api","shape":"box"},{"_gvid":38,"name":"[root] aws_cloudwatch_event_rule.everyday","label":"aws_cloudwatch_event_rule.everyday","shape":"box"},{"_gvid":39,"name":"[root] aws_cloudwatch_event_target.clean_up_urls_everyday","label":"aws_cloudwatch_event_target.clean_up_urls_everyday","shape":"box"},{"_gvid":40,"name":"[root] aws_iam_policy.invoke","label":"aws_iam_policy.invoke","shape":"box"},{"_gvid":41,"name":"[root] aws_iam_policy.ip","label":"aws_iam_policy.ip","shape":"box"},{"_gvid":42,"name":"[root] aws_iam_policy.ip_put","label":"aws_iam_policy.ip_put","shape":"box"},{"_gvid":43,"name":"[root] aws_iam_policy.lambda_fetch_s3","label":"aws_iam_policy.lambda_fetch_s3","shape":"box"},{"_gvid":44,"name":"[root] aws_iam_role.lambda_fetch_object_role","label":"aws_iam_role.lambda_fetch_object_role","shape":"box"},{"_gvid":45,"name":"[root] aws_iam_role.lambda_generate_url_helper_role","label":"aws_iam_role.lambda_generate_url_helper_role","shape":"box"},{"_gvid":46,"name":"[root] aws_iam_role.lambda_generate_url_role","label":"aws_iam_role.lambda_generate_url_role","shape":"box"},{"_gvid":47,"name":"[root] aws_iam_role.lambda_remove_urls_role","label":"aws_iam_role.lambda_remove_urls_role","shape":"box"},{"_gvid":48,"name":"[root] aws_iam_role.lambda_upload_url_role","label":"aws_iam_role.lambda_upload_url_role","shape":"box"},{"_gvid":49,"name":"[root] aws_iam_role_policy_attachment.invokehelper_gen","label":"aws_iam_role_policy_attachment.invokehelper_gen","shape":"box"},{"_gvid":50,"name":"[root] aws_iam_role_policy_attachment.invokehelper_remove","label":"aws_iam_role_policy_attachment.invokehelper_remove","shape":"box"},{"_gvid":51,"name":"[root] aws_iam_role_policy_attachment.lambdabasic_fetch","label":"aws_iam_role_policy_attachment.lambdabasic_fetch","shape":"box"},{"_gvid":52,"name":"[root] aws_iam_role_policy_attachment.lambdabasic_gen","label":"aws_iam_role_policy_attachment.lambdabasic_gen","shape":"box"},{"_gvid":53,"name":"[root] aws_iam_role_policy_attachment.lambdabasic_genhelp","label":"aws_iam_role_policy_attachment.lambdabasic_genhelp","shape":"box"},{"_gvid":54,"name":"[root] aws_iam_role_policy_attachment.s3full_gen","label":"aws_iam_role_policy_attachment.s3full_gen","shape":"box"},{"_gvid":55,"name":"[root] aws_iam_role_policy_attachment.s3full_remove","label":"aws_iam_role_policy_attachment.s3full_remove","shape":"box"},{"_gvid":56,"name":"[root] aws_iam_role_policy_attachment.s3ip_genhelp","label":"aws_iam_role_policy_attachment.s3ip_genhelp","shape":"box"},{"_gvid":57,"name":"[root] aws_iam_role_policy_attachment.s3ip_upload","label":"aws_iam_role_policy_attachment.s3ip_upload","shape":"box"},{"_gvid":58,"name":"[root] aws_iam_role_policy_attachment.s3read_fetch","label":"aws_iam_role_policy_attachment.s3read_fetch","shape":"box"},{"_gvid":59,"name":"[root] aws_lambda_function.fetch","label":"aws_lambda_function.fetch","shape":"box"},{"_gvid":60,"name":"[root] aws_lambda_function.gen","label":"aws_lambda_function.gen","shape":"box"},{"_gvid":61,"name":"[root] aws_lambda_function.genhelp","label":"aws_lambda_function.genhelp","shape":"box"},{"_gvid":62,"name":"[root] aws_lambda_function.remove","label":"aws_lambda_function.remove","shape":"box"},{"_gvid":63,"name":"[root] aws_lambda_function.upload","label":"aws_lambda_function.upload","shape":"box"},{"_gvid":64,"name":"[root] aws_lambda_permission.allow_cloudwatch_to_call_check_foo","label":"aws_lambda_permission.allow_cloudwatch_to_call_check_foo","shape":"box"},{"_gvid":65,"name":"[root] aws_lambda_permission.apigw_fetch_lambda","label":"aws_lambda_permission.apigw_fetch_lambda","shape":"box"},{"_gvid":66,"name":"[root] aws_lambda_permission.apigw_generate_lambda","label":"aws_lambda_permission.apigw_generate_lambda","shape":"box"},{"_gvid":67,"name":"[root] aws_lambda_permission.apigw_upload_lambda","label":"aws_lambda_permission.apigw_upload_lambda","shape":"box"},{"_gvid":68,"name":"[root] aws_route53_record.route","label":"aws_route53_record.route","shape":"box"},{"_gvid":69,"name":"[root] aws_route53_zone.primary","label":"aws_route53_zone.primary","shape":"box"},{"_gvid":70,"name":"[root] aws_s3_bucket.download_bucket","label":"aws_s3_bucket.download_bucket","shape":"box"},{"_gvid":71,"name":"[root] aws_s3_bucket.upload_bucket","label":"aws_s3_bucket.upload_bucket","shape":"box"},{"_gvid":72,"name":"[root] aws_s3_bucket_public_access_block.private_download_bucket","label":"aws_s3_bucket_public_access_block.private_download_bucket","shape":"box"},{"_gvid":73,"name":"[root] aws_s3_bucket_public_access_block.private_upload_bucket","label":"aws_s3_bucket_public_access_block.private_upload_bucket","shape":"box"},{"_gvid":74,"name":"[root] data.archive_file.fetch_object_code","label":"data.archive_file.fetch_object_code","shape":"box"},{"_gvid":75,"name":"[root] data.archive_file.generate_url_helper_code","label":"data.archive_file.generate_url_helper_code","shape":"box"},{"_gvid":76,"name":"[root] data.archive_file.generate_url_main_code","label":"data.archive_file.generate_url_main_code","shape":"box"},{"_gvid":77,"name":"[root] data.archive_file.remove_expired_urls_code","label":"data.archive_file.remove_expired_urls_code","shape":"box"},{"_gvid":78,"name":"[root] data.archive_file.upload_url_code","label":"data.archive_file.upload_url_code","shape":"box"},{"_gvid":79,"name":"[root] data.aws_acm_certificate.cert","label":"data.aws_acm_certificate.cert","shape":"box"},{"_gvid":80,"name":"[root] null_resource.build_image","label":"null_resource.build_image","shape":"box"},{"_gvid":81,"name":"[root] provider.archive","label":"provider.archive","shape":"diamond"},{"_gvid":82,"name":"[root] provider.aws","label":"provider.aws","shape":"diamond"},{"_gvid":83,"name":"[root] meta.count-boundary (EachMode fixup)","label":"\\N"},{"_gvid":84,"name":"[root] provider.archive (close)","label":"\\N"},{"_gvid":85,"name":"[root] provider.aws (close)","label":"\\N"},{"_gvid":86,"name":"[root] provider.null (close)","label":"\\N"},{"_gvid":87,"name":"[root] provisioner.local-exec (close)","label":"\\N"},{"_gvid":88,"name":"[root] root","label":"\\N"}],"edges":[{"_gvid":0,"tail":1,"head":2},{"_gvid":1,"tail":1,"head":3},{"_gvid":2,"tail":2,"head":4},{"_gvid":3,"tail":2,"head":5},{"_gvid":4,"tail":2,"head":7},{"_gvid":5,"tail":3,"head":79},{"_gvid":6,"tail":4,"head":14},{"_gvid":7,"tail":4,"head":59},{"_gvid":8,"tail":5,"head":15},{"_gvid":9,"tail":5,"head":60},{"_gvid":10,"tail":6,"head":16},{"_gvid":11,"tail":7,"head":17},{"_gvid":12,"tail":7,"head":63},{"_gvid":13,"tail":8,"head":18},{"_gvid":14,"tail":9,"head":4},{"_gvid":15,"tail":9,"head":19},{"_gvid":16,"tail":10,"head":22},{"_gvid":17,"tail":10,"head":70},{"_gvid":18,"tail":11,"head":26},{"_gvid":19,"tail":11,"head":70},{"_gvid":20,"tail":12,"head":28},{"_gvid":21,"tail":12,"head":71},{"_gvid":22,"tail":13,"head":31},{"_gvid":23,"tail":13,"head":71},{"_gvid":24,"tail":14,"head":32},{"_gvid":25,"tail":14,"head":34},{"_gvid":26,"tail":15,"head":33},{"_gvid":27,"tail":15,"head":35},{"_gvid":28,"tail":16,"head":35},{"_gvid":29,"tail":17,"head":36},{"_gvid":30,"tail":18,"head":36},{"_gvid":31,"tail":19,"head":14},{"_gvid":32,"tail":20,"head":14},{"_gvid":33,"tail":21,"head":15},{"_gvid":34,"tail":22,"head":15},{"_gvid":35,"tail":23,"head":15},{"_gvid":36,"tail":24,"head":15},{"_gvid":37,"tail":25,"head":15},{"_gvid":38,"tail":26,"head":16},{"_gvid":39,"tail":27,"head":17},{"_gvid":40,"tail":28,"head":17},{"_gvid":41,"tail":29,"head":17},{"_gvid":42,"tail":30,"head":17},{"_gvid":43,"tail":31,"head":18},{"_gvid":44,"tail":32,"head":37},{"_gvid":45,"tail":33,"head":37},{"_gvid":46,"tail":34,"head":37},{"_gvid":47,"tail":35,"head":37},{"_gvid":48,"tail":36,"head":37},{"_gvid":49,"tail":37,"head":82},{"_gvid":50,"tail":38,"head":82},{"_gvid":51,"tail":39,"head":38},{"_gvid":52,"tail":39,"head":62},{"_gvid":53,"tail":40,"head":61},{"_gvid":54,"tail":41,"head":82},{"_gvid":55,"tail":42,"head":82},{"_gvid":56,"tail":43,"head":82},{"_gvid":57,"tail":44,"head":82},{"_gvid":58,"tail":45,"head":82},{"_gvid":59,"tail":46,"head":82},{"_gvid":60,"tail":47,"head":82},{"_gvid":61,"tail":48,"head":82},{"_gvid":62,"tail":49,"head":40},{"_gvid":63,"tail":49,"head":46},{"_gvid":64,"tail":50,"head":40},{"_gvid":65,"tail":50,"head":47},{"_gvid":66,"tail":51,"head":44},{"_gvid":67,"tail":52,"head":46},{"_gvid":68,"tail":53,"head":45},{"_gvid":69,"tail":54,"head":46},{"_gvid":70,"tail":55,"head":47},{"_gvid":71,"tail":56,"head":41},{"_gvid":72,"tail":56,"head":45},{"_gvid":73,"tail":57,"head":42},{"_gvid":74,"tail":57,"head":48},{"_gvid":75,"tail":58,"head":43},{"_gvid":76,"tail":58,"head":44},{"_gvid":77,"tail":59,"head":44},{"_gvid":78,"tail":59,"head":70},{"_gvid":79,"tail":59,"head":74},{"_gvid":80,"tail":60,"head":46},{"_gvid":81,"tail":60,"head":70},{"_gvid":82,"tail":60,"head":76},{"_gvid":83,"tail":61,"head":45},{"_gvid":84,"tail":61,"head":75},{"_gvid":85,"tail":62,"head":47},{"_gvid":86,"tail":62,"head":70},{"_gvid":87,"tail":62,"head":77},{"_gvid":88,"tail":63,"head":48},{"_gvid":89,"tail":63,"head":71},{"_gvid":90,"tail":63,"head":78},{"_gvid":91,"tail":64,"head":38},{"_gvid":92,"tail":64,"head":62},{"_gvid":93,"tail":65,"head":14},{"_gvid":94,"tail":65,"head":59},{"_gvid":95,"tail":66,"head":15},{"_gvid":96,"tail":66,"head":60},{"_gvid":97,"tail":67,"head":17},{"_gvid":98,"tail":67,"head":63},{"_gvid":99,"tail":68,"head":3},{"_gvid":100,"tail":68,"head":69},{"_gvid":101,"tail":69,"head":82},{"_gvid":102,"tail":70,"head":82},{"_gvid":103,"tail":71,"head":70},{"_gvid":104,"tail":72,"head":70},{"_gvid":105,"tail":73,"head":71},{"_gvid":106,"tail":74,"head":81},{"_gvid":107,"tail":75,"head":81},{"_gvid":108,"tail":76,"head":81},{"_gvid":109,"tail":77,"head":81},{"_gvid":110,"tail":78,"head":81},{"_gvid":111,"tail":79,"head":82},{"_gvid":112,"tail":80,"head":71},{"_gvid":113,"tail":83,"head":1},{"_gvid":114,"tail":83,"head":6},{"_gvid":115,"tail":83,"head":8},{"_gvid":116,"tail":83,"head":9},{"_gvid":117,"tail":83,"head":10},{"_gvid":118,"tail":83,"head":11},{"_gvid":119,"tail":83,"head":12},{"_gvid":120,"tail":83,"head":13},{"_gvid":121,"tail":83,"head":20},{"_gvid":122,"tail":83,"head":21},{"_gvid":123,"tail":83,"head":23},{"_gvid":124,"tail":83,"head":24},{"_gvid":125,"tail":83,"head":25},{"_gvid":126,"tail":83,"head":27},{"_gvid":127,"tail":83,"head":29},{"_gvid":128,"tail":83,"head":30},{"_gvid":129,"tail":83,"head":39},{"_gvid":130,"tail":83,"head":49},{"_gvid":131,"tail":83,"head":50},{"_gvid":132,"tail":83,"head":51},{"_gvid":133,"tail":83,"head":52},{"_gvid":134,"tail":83,"head":53},{"_gvid":135,"tail":83,"head":54},{"_gvid":136,"tail":83,"head":55},{"_gvid":137,"tail":83,"head":56},{"_gvid":138,"tail":83,"head":57},{"_gvid":139,"tail":83,"head":58},{"_gvid":140,"tail":83,"head":64},{"_gvid":141,"tail":83,"head":65},{"_gvid":142,"tail":83,"head":66},{"_gvid":143,"tail":83,"head":67},{"_gvid":144,"tail":83,"head":68},{"_gvid":145,"tail":83,"head":72},{"_gvid":146,"tail":83,"head":73},{"_gvid":147,"tail":83,"head":80},{"_gvid":148,"tail":84,"head":74},{"_gvid":149,"tail":84,"head":75},{"_gvid":150,"tail":84,"head":76},{"_gvid":151,"tail":84,"head":77},{"_gvid":152,"tail":84,"head":78},{"_gvid":153,"tail":85,"head":1},{"_gvid":154,"tail":85,"head":6},{"_gvid":155,"tail":85,"head":8},{"_gvid":156,"tail":85,"head":9},{"_gvid":157,"tail":85,"head":10},{"_gvid":158,"tail":85,"head":11},{"_gvid":159,"tail":85,"head":12},{"_gvid":160,"tail":85,"head":13},{"_gvid":161,"tail":85,"head":20},{"_gvid":162,"tail":85,"head":21},{"_gvid":163,"tail":85,"head":23},{"_gvid":164,"tail":85,"head":24},{"_gvid":165,"tail":85,"head":25},{"_gvid":166,"tail":85,"head":27},{"_gvid":167,"tail":85,"head":29},{"_gvid":168,"tail":85,"head":30},{"_gvid":169,"tail":85,"head":39},{"_gvid":170,"tail":85,"head":49},{"_gvid":171,"tail":85,"head":50},{"_gvid":172,"tail":85,"head":51},{"_gvid":173,"tail":85,"head":52},{"_gvid":174,"tail":85,"head":53},{"_gvid":175,"tail":85,"head":54},{"_gvid":176,"tail":85,"head":55},{"_gvid":177,"tail":85,"head":56},{"_gvid":178,"tail":85,"head":57},{"_gvid":179,"tail":85,"head":58},{"_gvid":180,"tail":85,"head":64},{"_gvid":181,"tail":85,"head":65},{"_gvid":182,"tail":85,"head":66},{"_gvid":183,"tail":85,"head":67},{"_gvid":184,"tail":85,"head":68},{"_gvid":185,"tail":85,"head":72},{"_gvid":186,"tail":85,"head":73},{"_gvid":187,"tail":86,"head":80},{"_gvid":188,"tail":87,"head":80},{"_gvid":189,"tail":88,"head":83},{"_gvid":190,"tail":88,"head":84},{"_gvid":191,"tail":88,"head":85},{"_gvid":192,"tail":88,"head":86},{"_gvid":193,"tail":88,"head":87}]}'
    
    adj = adjacency_list(json_string)
    coordinates = gen_coordinates(adj)

    # # verification
    # x = []
    # y = []
    # z = []
    # for level in X.keys():
    #     x.extend(X[level])
    #     y.extend(Y[level])
    #     z.extend(Z[level])
    # #print(x)
    # #print(y)
    # #print(z)
    # graph(x, y, z, coordinates, adj, rev, show_level=False)
    # plt.show()

    # # return
    # obj = json.loads(json_string)
    # root = obj['objects'][0]['nodes'][-1]
    # for each in obj['objects'][1:]:
    #     each['coord-xyz'] = coordinates[root-each['_gvid']]

    print(coordinates)


if __name__== "__main__":
    main()