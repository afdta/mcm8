import data from "./data.js";
import format from "../../../js-modules/formats.js";

export default function chart(container){

    var outer_wrap = d3.select(container).classed("outer-wrap",true);

    var filter_wrap0 = outer_wrap.append("div").style("text-align","center");
    var filter_wrap = filter_wrap0.append("div").classed("c-fix",true)
                                  .style("padding","5px 0px 5px 0px")
                                  .style("display","inline-block");
   
    var input = filter_wrap.append("input").style("border","1px solid #aaaaaa")
                                           .style("border-width", "0px 0px 1px 0px")
                                           .style("outline","none")
                                           .style("padding","0px 4px")
                                           .style("margin","10px 30px 0px 0px")
                                           .style("background-color","none")
                                           .style("border-radius","0px")
                                           .style("float","left")
                                           .style("min-width","320px")
                                           .attr("placeholder",'Search (use commas to separate names)');
                                           
    filter_wrap.append("p").html("<em>Click on an income category to sort</em>&nbsp;▼")
                           .style("margin","10px 30px 0px 4px").style("float","left").style("padding","0px 0px");

    var search_string = null;

    var wrap = outer_wrap.append("div").style("width","100%").style("position","relative").style("padding","75px 0px 0px 0px")
                        .style("max-height","70vh").style("overflow-y","scroll");
    
    var header_wrap = wrap.append("div").style("height","75px").style("width","100%")
                            .style("position","absolute").style("top","0px").style("left","0px").style("background-color","#fafafa");

    var button_wrap = header_wrap.append("div").style("width","100%").style("position","relative").style("height","32px").style("margin-top","8px");
    var svg_axes = header_wrap.append("svg").attr("width","100%").attr("height","32px");
    
    var plot_wrap = wrap.append("div").style("width","100%").style("overflow", "visible");
    var svg = plot_wrap.append("svg").attr("width","100%").style("overflow","visible");

    var g_back = svg.append("g");
    var g_main = svg.append("g");
    var g_front0 = svg.append("g");
    var g_front1 = svg.append("g");

    var bar_height = 20; //plot area height
    var actual_bar_height = 10; //actual bar height (smaller than bar_height)
    var text_height = 35;
    var bar_pad = 30;

    function row_y(d,i){return i*(text_height+bar_height+bar_pad); }
    function row_translate(d,i){return "translate(0," + row_y(d,i) + ")"; }
    
    var data_array = [];
    for(var d in data){
        if(data.hasOwnProperty(d)){
            data_array.push(data[d]);
        }
    }

    //keep track of sorting
    var sortvar = "up";
    var sort_descending = true;

    var descending = function(a, b){
        var aval = a.shares.y17[sortvar];
        var bval = b.shares.y17[sortvar];
        return bval - aval;
    }
    var ascending = function(a, b){
        var aval = a.shares.y17[sortvar];
        var bval = b.shares.y17[sortvar];
        return aval - bval;
    };

    var share_format = d3.format(",.1%");
    var scale = d3.scaleLinear().domain([0,0.35]).range([0,16]);
    var positions = ["lo", "lomid", "mid", "upmid", "up"];
    var pos_scale = d3.scaleOrdinal().domain(positions).range([2, 22, 42, 62, 82]).unknown(100);
    var col_scale = d3.scaleOrdinal().domain(positions).range(['#fa9fb5','#f768a1','#dd3497','#ae017e','#7a0177']); //credit: http://colorbrewer2.org

    var names = {
        lo:"Lower",
        lomid:"Lower middle",
        mid:"Middle",
        upmid:"Upper middle",
        up:"Upper"
    }

    var ranks = {};
    ranks.lo = format.ranker(data_array.map(function(d){return d.shares.y17.lo}));
    ranks.lomid = format.ranker(data_array.map(function(d){return d.shares.y17.lomid}));
    ranks.mid = format.ranker(data_array.map(function(d){return d.shares.y17.mid}));
    ranks.upmid = format.ranker(data_array.map(function(d){return d.shares.y17.upmid}));
    ranks.up = format.ranker(data_array.map(function(d){return d.shares.y17.up}));

    //basic chart elements -- one time draw

    //plot rectangles
    var plot_boxes = g_back.selectAll("rect")
            .data(d3.range(0, data_array.length))
            .enter().append("rect")
            .attr("y", function(d,i){return row_y(d,i)+text_height-8})
            .attr("x","1%")
            .attr("width","98%")
            .attr("fill","#e0e0e0")
            .attr("stroke","#ffffff")
            .attr("rx","6")
            .attr("ry","6")
            .attr("height",bar_height+21);

    //grid/tick marks
    var grid_line_groups = g_front0.selectAll("g.grid-lines")
                            .data(d3.range(0, data_array.length).map(function(d,i){return positions}))
                                    .enter().append("g").classed("grid-lines",true)
                                    .attr("transform", row_translate);

    var grid_lines = grid_line_groups.selectAll("line.tick-mark").data(function(pos){
                                var xs = [0, 0.1, 0.2, 0.3];
                                var all = [];
                                pos.forEach(function(p){
                                    xs.forEach(function(x){
                                        all.push({x:x, xpos:pos_scale(p)+scale(x)});
                                    })
                                })
                                return all;
                            })
                            .enter()
                            .append("line").classed("tick-mark",true)
                            .attr("x1", function(d){return d.xpos+"%"})
                            .attr("x2", function(d){return d.xpos+"%"})
                            .attr("y1",text_height+bar_height)
                            .attr("y2",(text_height+bar_height+5))
                            .style("shape-rendering","crispEdges")
                            .attr("stroke",function(d,i){
                                return d.x==0 ? "#999999" : "#999999";
                            })
                            .style("visibility", "visible")
                            ;

    //individual plot axes
    var barline = grid_line_groups.selectAll("line.group-x-axis").data(function(d){return d});
    barline.enter().append("line").classed("group-x-axis",true).merge(barline)
                .attr("x1", function(p){return pos_scale(p)+"%"})
                .attr("x2", function(p){return (pos_scale(p)+scale.range()[1])+"%"})
                .attr("y1", text_height+bar_height).attr("y2", text_height+bar_height)
                .attr("stroke", "#999999")
                .style("shape-rendering","crispEdges")
                ;

    //top, labeled x-axis
    var axis_groups = svg_axes.selectAll("g.grid-lines").data(positions).enter().append("g").classed("grid-lines",true);
    var axis_lines = axis_groups.selectAll("line").data(function(d){
                                var xs = [0, 0.1, 0.2, 0.3];
                                return xs.map(function(x){return {pos:d, x:x}})
                            })
                            .enter()
                            .append("line")
                            .attr("x1", function(d){return (pos_scale(d.pos)+scale(d.x))+"%"})
                            .attr("x2", function(d){return (pos_scale(d.pos)+scale(d.x))+"%"})
                            .attr("y1","26px")
                            .attr("y2","32px")
                            .style("shape-rendering","crispEdges")
                            .attr("stroke",function(d,i){
                                return "#555555";
                            })
                            ;
    var axis_labels = axis_groups.selectAll("text").data(function(d){
                                var xs = [0, 0.1, 0.2, 0.3];
                                return xs.map(function(x){return {pos:d, x:x}})
                            })
                            .enter()
                            .append("text")
                            .attr("x", function(d){return (pos_scale(d.pos)+scale(d.x))+"%"})
                            .attr("text-anchor","start")
                            .attr("y","24")
                            .attr("fill","#555555")
                            .text(function(d){return (d.x*100)+"%"})
                            .attr("dx","-3")
                            .style("font-size","13px")
                            ;

    //group labels/buttons
    var group_labels = button_wrap.selectAll("div").data(positions)
                            .enter()
                            .append("div")
                            .style("position","absolute")
                            .style("width", (scale.range()[1]+2) + "%")
                            .style("left", function(d){return (pos_scale(d)-1) + "%"})
                            .style("background-color", function(d){return col_scale(d)})
                            .style("border-radius","12px")
                            .style("cursor","pointer")
                            .classed("toggle-button",true)
                            
    group_labels.append("p").text(function(d){return names[d]})
                            .style("color",function(d){return d=="lo" || d=="lomid" ? "#111111" : "#ffffff"})
                            .style("margin","0px")
                            .style("user-select","none")
                            ;

    group_labels.on("mousedown", function(d){
        if(sortvar === d){
            sort_descending = !sort_descending;
        }
        else{
            sort_descending = true;
        }

        group_labels.classed("sort-ascending", false).classed("sort-descending", false);

        sortvar = d;
        update();
    })

    var resize_timer;
    function window_resize(){
        var is_mobile = true;
        try{
            var box = wrap.node().getBoundingClientRect();
            var width = box.right - box.left;
            is_mobile = width < 800;
        }
        catch(e){

        }

        axis_labels.style("visibility", function(d,i){
            return is_mobile ? (i%2==0 ? "visible" : "hidden") : "visible"; 
        })

        axis_lines.style("visibility", function(d,i){
            return is_mobile ? (i%2==0 ? "visible" : "hidden") : "visible"; 
        })
        
    }


    window.addEventListener("resize", function(){
        clearTimeout(resize_timer);
        resize_timer = setTimeout(window_resize, 150);
    });

    wrap.node().addEventListener('scroll', function(){
        try{
            var top = !this.scrollTop ? 0 : this.scrollTop;
            
        }
        catch(e){
            var top = 0;
        }

        header_wrap.style("top", top+"px").style("border-bottom", top > 0 ? "1px solid #aaaaaa" : "none");
    });

    input.on("change", input_event_handler).on("input", input_event_handler);

    var input_timer;
    function input_event_handler(d){
        var v = (this.value+"");
        var vsplit = v.split(",").map(function(s){return s.replace(/^\s*|\s*$/g, "")})
                                 .filter(function(s){return s != ""});

        var vfinal = vsplit.join("|");
        
        clearTimeout(input_timer);
        input_timer = setTimeout(function(){
            try{
                if(vfinal.length==0 || vfinal==""){
                    search_string = null;
                }
                else{
                    search_string = vfinal;
                }
            }
            catch(e){
                search_string = null;
            }
    
            update();

            try{
                wrap.node().scrollTop = 0;
                header_wrap.style("top", "0px");
            }
            catch(e){

            }
        }, 50)
    }

    function update(){
        //mark appropriate button as descending
        group_labels.filter(function(d){return d===sortvar}).classed("sort-ascending", !sort_descending).classed("sort-descending", sort_descending);

        var rgxp = search_string === null ? null : new RegExp(search_string, "i");

        var sorted_data = data_array.slice(0).sort(sort_descending ? descending : ascending)
                                    .filter(function(d){
                                        return rgxp===null ? true : d.geo.name.search(rgxp) > -1;
                                    });

        svg.attr("height", sorted_data.length * (bar_height+text_height+bar_pad));

        var g_rows_up = g_main.selectAll("g.g-row").data(sorted_data, function(d){
            return d.geo.cbsa;
        });
        g_rows_up.exit().remove();
        var g_rows = g_rows_up.enter().append("g").classed("g-row",true).merge(g_rows_up);
        g_rows.interrupt().attr("transform", row_translate)

        //bars
        var bars_u = g_rows.selectAll("rect").data(function(d){
            return positions.map(function(p){return {pos:p, share:d.shares.y17[p]} });
        });
        bars_u.exit().remove();
        
        var bars = bars_u.enter().append("rect").merge(bars_u);
            bars.attr("x", function(d){return pos_scale(d.pos)+"%"})
                .attr("y", text_height + bar_height - actual_bar_height)
                .attr("width", function(d){return scale(d.share)+"%"})
                .attr("height", actual_bar_height)
                .attr("fill", function(d){return col_scale(d.pos)});

        //bar labels
        var barlab_u = g_rows.selectAll("text.bar-label").data(function(d){
            return positions.map(function(p){return {pos:p, share:d.shares.y17[p]} });
        });

        barlab_u.exit().remove();
        
        var bar_label_threshold = 0.175;
        var barlab = barlab_u.enter().append("text").classed("bar-label",true).merge(barlab_u);
            barlab.attr("x", function(d){return (pos_scale(d.pos) + scale(d.share))+"%"})
                .attr("text-anchor","end")
                .attr("dx","3")
                .attr("y", text_height+bar_height-actual_bar_height)
                .attr("dy","-1")
                .text(function(d){return share_format(d.share)});    

        //group (cbsa) labels        
        var labels_u = g_rows.selectAll("text.cbsa-label").data(function(d){
                    return [{name:d.geo.name, rank:ranks[sortvar](d.shares.y17[sortvar])}];
                });
        
            labels_u.exit().remove();                
        var labels = labels_u.enter().append("text").classed("cbsa-label",true).merge(labels_u);
            labels.attr("x", pos_scale("lo")+"%")
                .attr("dx","0%")
                .attr("y", text_height)
                .attr("dy","-11")
                .attr("fill", "#333333")
                .style("font-weight","bold")
                .text(function(d){return d.rank + ". " + d.name});
        
    }
        
    update();
    window_resize();

}