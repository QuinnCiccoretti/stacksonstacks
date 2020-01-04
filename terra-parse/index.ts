export function parseDotOutput(terraform_json_string:string){
  return JSON.parse(terraform_json_string.trim().replace(/\\/g,''));
}