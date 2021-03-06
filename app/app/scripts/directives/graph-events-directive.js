angular.module('cupcakeDashboard')
  .directive("graphEvents", function($http) {
    // constants
     var margin = {left: 65, right: 25, top: 10, bottom: 20},
       width = 640,
       height = 90;

     return {
       restrict: 'A',
       scope: {
         data: '=graphEvents',
         grouped: '=',
         phases: '=',
         projects: '='
       },
       link: function (scope, element, attrs) {

         // set up initial svg object
         var vis = d3.select(element[0])
           .append("svg")
             .attr("width", width + margin.left + margin.right)
             .attr("height", height + margin.top + margin.bottom)
             .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
             .append("g")
               .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

         scope.$watchCollection('[phases, data, projects]', function (newVal, oldVal) {

           // if 'val' is undefined, exit
           if (!newVal || newVal === oldVal) {
             return;
           }

           if (!scope.data || !scope.phases){
            return;
           }

            function getDateFromEvent(d){
              return new Date(d);
            }

            data = _.filter(scope.data, function(e){
              return e.model.phase != undefined;
            })

            var projectIds = _.pluck(scope.projects, '_id' );

            data = _.filter(data, function(e){
              return _.contains(projectIds, e.model._id)
            });

            data.sort(function(a, b){
              a = new Date(a.date);
              b = new Date(b.date);
              return a<b?-1:a>b?1:0;
            });

            var minX = getDateFromEvent(data[0].date);
            var maxX = getDateFromEvent(data[data.length-1].date);

            var Xscale = d3.time.scale().domain([minX, maxX]).range([0, width]);
            var Yscale = d3.scale.ordinal().domain(scope.phases.map(function(p){return p.phase;})).rangeBands([height, 0], 1);
            var color = d3.scale.linear().domain([0, scope.phases.length-1]).range(['#00D4F0','#E80275']);


            data.sort(function(a, b){
              a = new Date(a.date);
              b = new Date(b.date);
              return a<b?-1:a>b?1:0;
            });


            var xAxis = d3.svg.axis().scale(Xscale).orient('bottom');
            var yAxis = d3.svg.axis().scale(Yscale)
              .orient('left')
              .tickFormat(function(d) {
                return scope.phases[d].title;
              });


            function transitionDots() {
               vis.selectAll('*').remove();

               vis.selectAll("svg")
               .append("g")
               .data(data)
               .enter().append("circle")
               .transition()
               .delay(function(d, i){ return i; })
               .attr("opacity", "0")
               .duration(100)
               .attr("r", function(d){
                if(d.verb == 'POST')
                {
                  return '6px';
                }
                else
                {
                  return '4px';
                }
               })
               .attr("data-phase", function(d){ return d.model.phase; })
               .attr({
                  'cx': function(e){ return Xscale(getDateFromEvent(e.date))},
                  'cy': function(e){return Yscale(e.model.phase)}
               })
               .attr("fill", function(e){
                 if(e.verb == 'POST')
                 {
                   return '#00F0E0';
                 }
                 else
                 {
                   return color(e.model.phase);
                 }
               })
               .each("end", transitionEnd);


              vis.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

              vis.append("g")
                .attr("class", "axis")
                .call(yAxis);

               function transitionEnd() {
                 d3.select(this)
                  .transition()
                  .duration(500)
                  .attr("opacity", "0.25");
                  // .attr({
                  //    'cy': function(e){return Yscale(e.model.phase)}
                  // })
                  // .attr("fill", function(e){
                  //   if(e.verb == 'POST')
                  //   {
                  //     return '#00F0E0';
                  //   }
                  //   else
                  //   {
                  //     return color(e.model.phase);
                  //   }
                  // });
               }
             }

             transitionDots();

         });
      }
    }
});