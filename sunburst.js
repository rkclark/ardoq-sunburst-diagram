{
	init: function() {
		//set fill for workspace nodes which don't have their own colours set by the Ardoq model
		this.addCSS(".workspace.sunburst-opac", "fill:#888;");

		//make the root node (i.e. the center of the diagram) transparent
		this.addCSS(".rootNode", "opacity:0;");

		//set specific opacity for hierarchy levels
		this.addCSS(".sunburst-opac", "opacity:0.4;");
		this.addCSS(".level1.sunburst-opac, .workspace.sunburst-opac", "opacity:1;");
		this.addCSS(".level2.sunburst-opac", "opacity:0.9;");
		this.addCSS(".level3.sunburst-opac", "opacity:0.775;");
		this.addCSS(".level4.sunburst-opac", "opacity:0.65;");
		this.addCSS(".level5.sunburst-opac", "opacity:0.525;");
		this.addCSS(".level6.sunburst-opac", "opacity:0.5;");
		this.addCSS(".pathHover", "opacity:0.3; -webkit-transition: opacity .3s linear; transition: opacity .3s linear;");

		//Style tooltips
		this.addCSS(".sunburst-tooltip", "pointer-events:none;");
		this.addCSS(".sunburst-tooltip > .tooltip-inner", "background-color:#555; font-size:7pt; padding:1px 4px;");
		this.addCSS(".sunburst-tooltip.right > .tooltip-arrow", "border-right: none;");
		this.addCSS(".sunburst-tooltip.left > .tooltip-arrow", "border-left: none;");

		//Override bootstrap's fade as doesn't work well with the transforms being used on the tooltips
		this.addCSS(".fade", "opacity:0; -webkit-transition: opacity .0s linear !important; transition: opacity .0s linear !important;");

    //Add toggle sticky labels menu button
		this.addMenu({
			name: "Toggle sticky labels",
			id: "toggleSticky",
			icon: "fa fa-cube",
			class: "active",
			click: function() {
				if ($(this).toggleClass('active').hasClass('active')) {
					$(this).parent().addClass("active");
				} else {
					$(this).parent().removeClass("active");
					$('[data-toggle="tooltip"]').tooltip("hide");
					$(".tooltip").css("transform", "");
				}
			}
		});

		var that = this;
		LOG.log("init", this);
	},

	localRender: function() {
		//Pull through component data dnd construct the visualisation

		LOG.log(this);
		var that = this;
		that.result = this.getD3ComponentHierarchy(true);

		var container = this.getContainerElement();
		container.empty();
		$(".tooltip").remove();

		var d3svg = this.getD3SVG();

		//Create object of nodes based on the workspace hierarchy
		var nodes = that.result.selectedNode;

		// Set svg variables
		var width = this.getWidth(),
			height = this.getHeight(),
			radius = (Math.min(width, height) / 2) - 10;

		var formatNumber = d3.format(",d");

		var x = d3.scale.linear()
			.range([0, 2 * Math.PI]);

		var y = d3.scale.sqrt()
			.range([0, radius]);

		//var partition = d3.layout.partition()
		//.value(function(d) { return d.size; });
		//Set the partition value to just be 1 - we don't want to derive arc size based on a data value. Original code preserved above.

		var partition = d3.layout.partition()
			.value(function(d) {
				return 1;
			});

		var arc = d3.svg.arc()
			.startAngle(function(d) {
				return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
			})
			.endAngle(function(d) {
				return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
			})
			.innerRadius(function(d) {
				return Math.max(0, y(d.y));
			})
			.outerRadius(function(d) {
				return Math.max(0, y(d.y + d.dy));
			});

		var svg = d3svg
			.attr("width", width)
			.attr("height", height)
			.attr("id", "sunburst")
			.append("g")
			.attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

		svg.selectAll("path")
      //Pass our nodes object into the d3 function
			.data(partition.nodes(nodes))
			.enter().append("path")
			.attr("d", arc)
			.style("stroke", "#fff")
			.attr("class", function(d) {
				if (d.css) {
					//set custom class to add to the paths for the CSS rules - if just use the ardoq classes then this impacts other parts of the application
					var opac = " sunburst-opac";
					return d.css + opac;
				} else {
					return "rootNode";
				}
			})
			.attr("id", function(d) {
				return d.key;
			})
			.on("click", click)
			//add title attribute to support tooltip
			.attr("title", function(d) {
				return d.name;
			})
			//add tooltip but not for the rootnode
			.attr("data-toggle", function(d) {
				if (d.root == true) {
					return "";
				} else {
					return "tooltip";
				}
			});

		//Work out where the center of the diagram is
		var svgLeft = $("[id='sunburst']").offset().left;
		var svgCenter = svgLeft + (width / 2);

		//Initialise tooltips
		$('[data-toggle="tooltip"]').tooltip({
			container: container,
			trigger: 'manual',
			template: '<div class="tooltip sunburst-tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
      //Position the tooltip on left or right of the arc depending on whether arc is on left or right of center of diagram
			placement: function(tip, element) {
				var pathWidth = $(element)[0].getBBox().width;
				var position = $(element).offset();
				var pathCenter = position.left + (pathWidth / 2);
				if (pathCenter > svgCenter) {
					return "right";
				}
				if (pathCenter < svgCenter) {
					return "left";
				}
				return "right";
			}
		});

		$('[data-toggle="tooltip"]').on("mouseover", showTip);
		$('[data-toggle="tooltip"]').on("mouseleave", hideTip);

		function showTip(d) {
			var pathClass = $(this).attr("class");
			$(this).attr("class", pathClass + " pathHover");
			//check if tooltip already exists for this path
			if ($(this).attr("aria-describedby")) {
				//we have a tooltip already
				return;
			} else {
				//get width of the path element being tooltipped
				var pathWidth = $(this)[0].getBBox().width;
				//To stop erroneous tooltips being shown for paths that are currently not displayed when zoomed in, make sure the path has some width if the tooltip is to be shown
				if (pathWidth < 1) {
					return;
				} else {
					//no existing tooltip, proceed
					$(this).tooltip("show");
					//get the ID of the tooltip that has been generated
					var myTooltip = $(this).attr("aria-describedby");
					//move the tooltip into the center of the path
					$("#" + myTooltip).css("transform", function() {
						if ($(this).hasClass("left")) {
							var transform = "translateX(" + (pathWidth / 2) + "px)";
						}
						if ($(this).hasClass("right")) {
							var transform = "translateX(-" + (pathWidth / 2) + "px)";
						}
						return transform
					});
				}
			}
		}

		function hideTip(d) {
			var classString = $(this).attr("class");
			var lastIndex = classString.lastIndexOf(" ");
			classString = classString.substring(0, lastIndex);
			$(this).attr("class", classString);
			if ($("#toggleSticky").hasClass("active")) {
				//sticky tooltips are selected, do nothing
			} else {
				var myTooltip = $(this).attr("aria-describedby");
				$("#" + myTooltip).tooltip("hide");
				$("#" + myTooltip).css("transform", "");
			}
		}

    //Hide all tooltips when the sunburst is clicked
		$("[id='sunburst']").on("click", hideAllTips);
		function hideAllTips(d) {
			$('[data-toggle="tooltip"]').tooltip("hide");
			$(".tooltip").css("transform", "");
		}

    //Handle visualisation transform when user clicks
		function click(d) {
			svg.transition()
				.duration(750)
				.tween("scale", function() {
					var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
						yd = d3.interpolate(y.domain(), [d.y, 1]),
						yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
					return function(t) {
						x.domain(xd(t));
						y.domain(yd(t)).range(yr(t));
					};
				})
				.selectAll("path")
				.attrTween("d", function(d) {
					return function() {
						return arc(d);
					};
				});
		}
    
		d3.select(self.frameElement).style("height", height + "px");
	}
}
