export function parseDotOutput(terraform_json_string:string){
  console.log(terraform_json_string);
  return JSON.parse(terraform_json_string.replace(/\\N/g,''));
}