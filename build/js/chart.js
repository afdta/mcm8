import data from "./data.js";

export default function chart(container){
    var wrap = d3.select(container).style("min-width","360px").style("max-width","1200px").style("margin","0px auto");
    
    var header_wrap = wrap.append("div").style("width","100%").style("position","relative").style("height","2rem");
    var svg_axes = wrap.append("svg").attr("width","100%").attr("height","32px");
    
    var plot_wrap = wrap.append("div").style("width","100%").style("overflow", "visible");
    var svg = plot_wrap.append("svg").attr("width","100%").style("overflow","visible");

    var g_back = svg.append("g");
    var g_main = svg.append("g");
    var g_front = svg.append("g");

    var bar_height = 13;
    var bar_pad = 16;
    
    var data_array = [];
    for(var d in data){
        if(data.hasOwnProperty(d)){
            data_array.push(data[d]);
        }
    }

    //keep track of sorting
    var sortvar = "up";
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
    var pos_scale = d3.scaleOrdinal().domain(positions).range([1, 21, 41, 61, 81]).unknown(100);
    var col_scale = d3.scaleOrdinal().domain(positions).range(['#fa9fb5','#f768a1','#dd3497','#ae017e','#7a0177']); //credit: http://colorbrewer2.org
    var col_scale_text = function(v){
        return v=="lo" || v=="lomid" ? "#333333" : "#eeeeee";
    }
    var names = {
        lo:"Lower",
        lomid:"Lower middle",
        mid:"Middle",
        upmid:"Upper middle",
        up:"Upper"
    }

    function update(){
        var sorted_data = data_array.slice(0).sort(descending);

        svg.attr("height", sorted_data.length * (bar_height+bar_pad));

        var g_rows_up = g_main.selectAll("g.g-row").data(sorted_data, function(d){
            return d.geo.cbsa;
        });
        g_rows_up.exit().remove();
        
        var g_rows = g_rows_up.enter().append("g").classed("g-row",true).merge(g_rows_up);

        g_rows.interrupt().transition().duration(1500).attr("transform", function(d,i){
            return "translate(0," + (i*(bar_height+bar_pad)) + ")";
        })

        //bars
        var bars_u = g_rows.selectAll("rect").data(function(d){
            return positions.map(function(p){return {pos:p, share:d.shares.y17[p]} });
        });

        bars_u.exit().remove();
        
        var bars = bars_u.enter().append("rect").merge(bars_u);
            bars.attr("x", function(d){return pos_scale(d.pos)+"%"})
                .attr("y", bar_pad)

                .attr("width", function(d){return scale(d.share)+"%"})
                .attr("height", bar_height)
                .attr("fill", function(d){return col_scale(d.pos)});

        //bar labels
        var barlab_u = g_rows.selectAll("text.bar-label").data(function(d){
            return positions.map(function(p){return {pos:p, share:d.shares.y17[p]} });
        });

        barlab_u.exit().remove();
        
        var barlab = barlab_u.enter().append("text").merge(barlab_u);
            barlab.attr("x", function(d){return (pos_scale(d.pos) + scale(d.share))+"%"})
                .attr("dx", "-2")
                .attr("y", bar_pad+bar_height)
                .attr("dy","-1")
                .style("font-size","13px")
                .style("font-weight","normal")
                .attr("text-anchor","end")
                .attr("fill", function(d){return col_scale_text(d.pos)})
                .text(function(d){return share_format(d.share)});

        //group (cbsa) labels        
        var labels_u = g_rows.selectAll("text.cbsa-label").data(function(d){
                    return [d.geo.name];
                });
        
            labels_u.exit().remove();                
        var labels = labels_u.enter().append("text").classed("cbsa-label",true).merge(labels_u);
            labels.attr("x", pos_scale(sortvar)+"%")
                .attr("dx","3")
                .attr("y", bar_pad)
                .attr("dy","-2")
                .attr("fill", "#333333")
                .style("font-size","13px")
                .text(function(d){return d});
    }

    //set up svg axes
    var axis_groups = g_back.selectAll("g.grid-lines").data(positions).enter().append("g").classed("grid-lines",true);
    var axis_lines = axis_groups.selectAll("line").data(function(d){
                                var xs = [0, 0.1, 0.2, 0.3];
                                return xs.map(function(x){return {pos:d, x:x}})
                            })
                            .enter()
                            .append("line")
                            .attr("x1", function(d){return (pos_scale(d.pos)+scale(d.x))+"%"})
                            .attr("x2", function(d){return (pos_scale(d.pos)+scale(d.x))+"%"})
                            .attr("y1","0%")
                            .attr("y2","100%")
                            .style("shape-rendering","crispEdges")
                            .attr("stroke",function(d,i){
                                return i==0 ? "#555555" : "#cccccc";
                            })
                            ;

    var axis_groups0 = svg_axes.selectAll("g.grid-lines").data(positions).enter().append("g").classed("grid-lines",true);
    var axis_lines0 = axis_groups0.selectAll("line").data(function(d){
                                var xs = [0, 0.1, 0.2, 0.3];
                                return xs.map(function(x){return {pos:d, x:x}})
                            })
                            .enter()
                            .append("line")
                            .attr("x1", function(d){return (pos_scale(d.pos)+scale(d.x))+"%"})
                            .attr("x2", function(d){return (pos_scale(d.pos)+scale(d.x))+"%"})
                            .attr("y1","22px")
                            .attr("y2","32px")
                            .style("shape-rendering","crispEdges")
                            .attr("stroke",function(d,i){
                                return "#555555";
                            })
                            ;
    var axis_labels = axis_groups0.selectAll("text").data(function(d){
                                var xs = [0, 0.1, 0.2, 0.3];
                                return xs.map(function(x){return {pos:d, x:x}})
                            })
                            .enter()
                            .append("text")
                            .attr("x", function(d){return (pos_scale(d.pos)+scale(d.x))+"%"})
                            .attr("text-anchor","start")
                            .attr("y","20")
                            .attr("fill","#555555")
                            .text(function(d){return (d.x*100)+"%"})
                            .attr("dx","-3")
                            .style("font-size","13px")
                            ;

    var group_labels = header_wrap.selectAll("div").data(positions)
                            .enter()
                            .append("div")
                            .style("position","absolute")
                            .style("width", (scale.range()[1]+2) + "%")
                            .style("left", function(d){return (pos_scale(d)-1) + "%"})
                            .style("background-color", function(d){return col_scale(d)})
                            .style("padding","5px 10px")
                            .style("height","2rem")
                            .style("border-radius","12px")
                            .style("cursor","pointer")
                            
    group_labels.append("p").text(function(d){return names[d]})
                            .style("color","#ffffff")
                            .style("margin","0px")
                            .style("line-height","2rem")
                            .style("user-select","none")
                            ;

    group_labels.on("mousedown", function(d){
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

        axis_lines0.style("visibility", function(d,i){
            return is_mobile ? (i%2==0 ? "visible" : "hidden") : "visible"; 
        })
        
    }


    window.addEventListener("resize", function(){
        clearTimeout(resize_timer);
        resize_timer = setTimeout(window_resize, 150);
    });
        
    update();
    window_resize();

}