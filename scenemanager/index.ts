import * as THREE from "three";
import {createCube, NodeCube, TextCreator} from 'threeml';
import {DragDropManager} from 'dragdrop'

export class SceneManager extends THREE.Scene{
    text_creator:TextCreator;
    drag_drop_manager:DragDropManager;
    obj_list:NodeCube[];
    arrow_list:THREE.ArrowHelper[];
    lineMat:THREE.LineBasicMaterial;
    groundMat:THREE.MeshLambertMaterial;
    camera:THREE.PerspectiveCamera;
    tf_json:any;

    constructor(){
        super();
        this.text_creator = new TextCreator();
        this.obj_list = [];
        this.arrow_list = [];
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
        this.camera.position.z = 5;
        this.add(this.camera);
        this.lineMat = new THREE.LineBasicMaterial({color:0x0, linewidth:2});
        var reticle = this.createReticle();
        this.drag_drop_manager = new DragDropManager(this, this.camera, reticle);
        
        this.groundMat = new THREE.MeshLambertMaterial( { color: 0xededed } );

        this.createDirLight( new THREE.Vector3(0,12,0) );
        this.createFloor();
        this.updateSkyColor("#ffffff");
    }

    //draw reticle
    createReticle(){
    	var line_geom = new THREE.BufferGeometry();
        var xhairsz = 0.004;
        var vertices = new Float32Array([
        	-xhairsz, xhairsz, 0,
        	xhairsz, xhairsz, 0,
        	xhairsz, -xhairsz, 0,
        	-xhairsz, -xhairsz, 0,
        	-xhairsz, xhairsz, 0,
    	]);
        line_geom.setAttribute('position', new THREE.BufferAttribute(vertices,3));
        var reticle = new THREE.Line(line_geom, this.lineMat);
        reticle.position.z = -0.5;
        this.camera.add(reticle);

        var click_geom = new THREE.BufferGeometry();
        var vertices = new Float32Array([
            0,0,0
        ]);
        click_geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        var click_mat = new THREE.PointsMaterial({color:0x0, size:3.0,sizeAttenuation:false});
        var click_pt = new THREE.Points(click_geom, click_mat);
        click_pt.position.z = -0.5;
        document.body.addEventListener('mousedown', ()=>{
            this.camera.add(click_pt);
        })
        document.body.addEventListener('mouseup', ()=>{
            this.camera.remove(click_pt);
        })
        return reticle;

    }

    createDirLight(position:THREE.Vector3){
        var light = new THREE.DirectionalLight( 0xffffff );
        light.position.copy( position );
        light.castShadow = true;
        var shadow_range = 40;
        light.shadow.camera.top = shadow_range;
        light.shadow.camera.bottom = -shadow_range;
        light.shadow.camera.right = shadow_range;
        light.shadow.camera.left = -shadow_range;
        light.shadow.mapSize.set( 4096, 4096 );
        this.add( light );
    }
    createFloor(){
        //floor plane
        var floorsize = 100;
        var groundGeo = new THREE.PlaneBufferGeometry( floorsize, floorsize );
        var ground = new THREE.Mesh( groundGeo, this.groundMat );
        ground.position.y = -1.6;
        ground.rotation.x = - Math.PI / 2;
        ground.receiveShadow = true;
        this.add(ground);

        var gridHelper = new THREE.GridHelper( 10, 10 );
        gridHelper.position.set(0,-1.6,0);
        this.add( gridHelper );
   
    }
    updateScene(){
        this.drag_drop_manager.updateSelectedArrows();
        this.drag_drop_manager.castRay();
    }
    path_to_all_icons:string = "img/";
    //some of these may be arbitrarily decided symbols, nothing more
    //assumes all end in .png
    name_to_path:Record<string,string> = {
        "root":"root",
        //gcp
        "google_compute_instance.vm_instance":"gcp/Compute/Compute_Engine",
        "google_compute_network.vpc_network":"gcp/Networking/Virtual_Private_Cloud",
        "provider.google":"gcp/Extras/Google_Cloud_Platform",
        "google_project.my_project":"gcp/Cloud_AI/Cloud_Natural_Language_API",
        //aws
        "aws_cognito_user_pool.pool":"aws/Cognito",
        "aws_iam_role.main":"aws/IAM",
        "aws_iam_role.cidp":"aws/IAMSTS",
        "aws_lambda_function.main":"aws/Lambda",
        "provider.aws":"aws/provider",
        "aws_alb.main":"aws/elb",
        "aws_alb_listener.front_end":"aws/elb",
        "aws_alb_target_group.test":"aws/elb",
        "aws_autoscaling_group.app":"aws/autoscaling_group",
        "aws_cloudwatch_log_group.app":"aws/cloudwatch",
        "aws_cloudwatch_log_group.ecs":"aws/cloudwatch",
        "aws_ecs_cluster.main":"aws/ecs",
        "aws_ecs_service.test":"aws/ecs",
        "aws_ecs_task_definition.ghost":"aws/ecs",
        "aws_iam_instance_profile.app":"aws/IAM",
        "aws_iam_role.app_instance":"aws/IAM",
        "aws_iam_role.ecs_service":"aws/IAM",
        "aws_iam_role_policy.ecs_service":"aws/IAM",
        "aws_iam_role_policy.instance":"aws/IAMSTS",
        "aws_internet_gateway.gw":"aws/vpc_gateway",
        "aws_launch_configuration.app":"aws/config",
        "aws_route_table.r":"aws/route_table",
        "aws_route_table_association.a":"aws/route_table",
        "aws_security_group.instance_sg":"aws/security",
        "aws_security_group.lb_sg":"aws/security",
        "aws_subnet.main":"aws/subnet",
        "aws_vpc.main":"aws/vpc"

    }
    get_iconpath_from_resourcename(name:string): string{
        name = name.trim();
        var iconpath:string = this.name_to_path[name];
        if(iconpath && name){
            return this.path_to_all_icons + iconpath + ".png"
        }
        else if(name.includes("aws")){
            return this.path_to_all_icons + "aws/General.png"
        }
        return this.path_to_all_icons + "gcp/Extras/Generic_GCP.png";
    }
    updateSkyColor(color:string){
        this.background = new THREE.Color( color );
        var hexcolor = parseInt(color.replace(/^#/, ''), 16);
        for(var arrow of this.arrow_list){
            arrow.setColor(~hexcolor);
        }
        this.lineMat.color.setHex(~hexcolor);
        this.drag_drop_manager.setColors(~hexcolor);
    }
    updateGroundColor(color:string){
        var hexcolor = parseInt(color.replace(/^#/, ''), 16);
        this.groundMat.color.setHex(hexcolor);
    }
    cleanObjects(){
        for(var cube of this.obj_list){
            this.remove(cube);
            this.camera.remove(cube);
            cube.geometry.dispose();
            (<THREE.Material>cube.material).dispose();
        }
        for(var arrow of this.arrow_list){
            this.remove(arrow);
        }
        this.obj_list = [];
        this.arrow_list = [];
    }
    async make_cubes(tf_json:any){
        this.cleanObjects();
        this.tf_json = tf_json;
        var gvid_to_cube:Record<number,NodeCube> = {};
        // gvid_to_cube[
        const resource_list = this.tf_json.objects;
        //start at one to skip root node
        for(var i = 1; i < resource_list.length; i++){
            var curr_resource = resource_list[i];
            var resource_name = curr_resource.name.replace("[root]",'').trim();
            var icon_path:string = this.get_iconpath_from_resourcename(resource_name);
            var cube = await createCube(icon_path);
            var label = await this.text_creator.createTextMesh(resource_name, 0.25, 0.01);
            label.position.set(-0.6,-1,0); //offset label and cube
            cube.label = label;
            cube.add(label);
            var pos = curr_resource["coord-xyz"];
            if(!pos){
                pos = [Math.random()*10,Math.random()*10,Math.random()*10];
            }
            cube.position.set(pos[0], pos[1], pos[2]);
            this.add(cube);
            this.obj_list.push(cube); //insert into our "graph"
            gvid_to_cube[curr_resource._gvid] = cube;

        }

        //camera should look in a decent direction
        this.camera.lookAt(this.obj_list[0].position);

        const edges = this.tf_json.edges;
        for(const edge of edges){
            var tail_cube = gvid_to_cube[edge.tail];
            var head_cube = gvid_to_cube[edge.head];
            tail_cube.edges_out.push(head_cube);
            head_cube.edges_in.push(tail_cube);
            //draw the edge
            var cubepos = tail_cube.position;
            var npos = head_cube.position;
            var direction = npos.clone().sub(cubepos);
            var length = direction.length();
            const cone_length = 0.5;
            var arrow = new THREE.ArrowHelper(
                direction.normalize(),
                cubepos,
                length-cone_length,
                0x0,
                cone_length,
                cone_length/2
            );
            this.add(arrow);
            this.arrow_list.push(arrow);
            tail_cube.arrows_out.push(arrow);
            head_cube.arrows_in.push(arrow);
                            
        }
        // var josh = "https://scontent-iad3-1.xx.fbcdn.net/v/t31.0-8/28701384_611205672553420_861063517891691345_o.jpg?_nc_cat=108&_nc_oc=AQkES19skZE56YmLT3a6H6U8xRKrLBB6h_hPjjlzvx8aED3WbZfB5bocBSZMHjgs1T0&_nc_ht=scontent-iad3-1.xx&oh=40bcd73e3df92eb235b5f4e05e5e7beb&oe=5E7A74A1";
        // createCube(josh).then( ( joshcube ) =>{

        //     joshcube.position.set(0,2,0);
        //     joshcube.castShadow = true;
        //     this.add(joshcube);
        //     this.obj_list.push(joshcube);

        // }).catch( (err)=>{
        //     console.log(err);

        // });
        
        this.drag_drop_manager.setupRaycasting(this.obj_list);

    }

}