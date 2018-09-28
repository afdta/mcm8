import degradation from "../../../js-modules/degradation.js";

import chart from "./chart.js";

//main function
function main(){

  var compat = degradation(document.getElementById("metro-interactive"));


  //browser degradation
  if(compat.browser()){
    chart(document.getElementById("middle-class-bars"));
  }


} //close main()


document.addEventListener("DOMContentLoaded", main);
