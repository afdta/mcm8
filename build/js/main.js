import dir from "../../../js-modules/rackspace.js";
import degradation from "../../../js-modules/degradation.js";

import chart from "./chart.js";

//main function
function main(){


  //local
  dir.local("./");
  //dir.add("dirAlias", "path/to/dir");
  //dir.add("dirAlias", "path/to/dir");


  //production data
  //dir.add("dirAlias", "rackspace-slug/path/to/dir");
  //dir.add("dirAlias", "rackspace-slug/path/to/dir");
  var compat = degradation(document.getElementById("metro-interactive"));


  //browser degradation
  if(compat.browser()){
    chart(document.getElementById("middle-class-bars"));
  }


} //close main()


document.addEventListener("DOMContentLoaded", main);
