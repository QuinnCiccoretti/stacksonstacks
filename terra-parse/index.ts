var terraform_json_string:string = `{
  "name": "%3",
  "directed": true,
  "strict": false,
  "compound": "true",
  "newrank": "true",
  "_subgraph_cnt": 1,
  "objects": [
    {
      "name": "root",
      "compound": "true",
      "newrank": "true",
      "_gvid": 0,
      "nodes": [
        1,2,3,4,5,6,7,8,9
      ],
      "edges": [
        0,1,2,3,4,5,6,7,8,9,10,11
      ]
    },
    {
      "_gvid": 1,
      "name": "[root] aws_cognito_user_pool.pool",
      "label": "aws_cognito_user_pool.pool",
      "shape": "box"
    },
    {
      "_gvid": 2,
      "name": "[root] aws_iam_role.cidp",
      "label": "aws_iam_role.cidp",
      "shape": "box"
    },
    {
      "_gvid": 3,
      "name": "[root] aws_iam_role.main",
      "label": "aws_iam_role.main",
      "shape": "box"
    },
    {
      "_gvid": 4,
      "name": "[root] aws_iam_role_policy.main",
      "label": "aws_iam_role_policy.main",
      "shape": "box"
    },
    {
      "_gvid": 5,
      "name": "[root] aws_lambda_function.main",
      "label": "aws_lambda_function.main",
      "shape": "box"
    },
    {
      "_gvid": 6,
      "name": "[root] provider.aws",
      "label": "provider.aws",
      "shape": "diamond"
    },
    {
      "_gvid": 7,
      "name": "[root] meta.count-boundary (EachMode fixup)",
      "label": "\\N"
    },
    {
      "_gvid": 8,
      "name": "[root] provider.aws (close)",
      "label": "\\N"
    },
    {
      "_gvid": 9,
      "name": "[root] root",
      "label": "\\N"
    }
  ],
  "edges": [
    {
      "_gvid": 0,
      "tail": 1,
      "head": 2
    },
    {
      "_gvid": 1,
      "tail": 1,
      "head": 5
    },
    {
      "_gvid": 2,
      "tail": 2,
      "head": 6
    },
    {
      "_gvid": 3,
      "tail": 3,
      "head": 6
    },
    {
      "_gvid": 4,
      "tail": 4,
      "head": 2
    },
    {
      "_gvid": 5,
      "tail": 5,
      "head": 3
    },
    {
      "_gvid": 6,
      "tail": 7,
      "head": 1
    },
    {
      "_gvid": 7,
      "tail": 7,
      "head": 4
    },
    {
      "_gvid": 8,
      "tail": 8,
      "head": 1
    },
    {
      "_gvid": 9,
      "tail": 8,
      "head": 4
    },
    {
      "_gvid": 10,
      "tail": 9,
      "head": 7
    },
    {
      "_gvid": 11,
      "tail": 9,
      "head": 8
    }
  ]
}`;

export function parseDotOutput(){
  return JSON.parse(terraform_json_string.replace("\\N",""));
}