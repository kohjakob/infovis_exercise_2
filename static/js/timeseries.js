document.addEventListener("DOMContentLoaded", function() {
    const timestepData = data.timestep_features;

    const margin = {top: 20, right: 20, bottom: 50, left: 50},
          width = 1190 - margin.left - margin.right,
          height = 550 - margin.top - margin.bottom;

    const svg = d3.select("#timeseries")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Populate the feature dropdown
    const features = Object.keys(timestepData[0]).filter(key => key !== 'season' && key !== 'team_name');
    const featureSelect = d3.select("#featureSelect");
    features.forEach(feature => {
        featureSelect.append("option")
            .attr("value", feature)
            .text(feature);
    });

    // Scales and axes
    const xScale = d3.scalePoint().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`);

    svg.append("g")
        .attr("class", "y axis");

    // Line generator
    const line = d3.line()
                   .x(d => xScale(d.season))
                   .y(d => yScale(d.value));

    // Update the timeseries chart
    window.updateTimeseries = function(teamName) {
        const selectedFeature = featureSelect.node().value;
        const filteredData = timestepData.filter(d => d.team_name === teamName)
                                         .map(d => ({ season: d.season, value: d[selectedFeature] }));

        if (filteredData.length === 0) return;

        xScale.domain(filteredData.map(d => d.season));
        yScale.domain([0, d3.max(filteredData, d => d.value)]); // Adjusted to start y-axis from 0

        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);

        const path = svg.selectAll(".line")
                        .data([filteredData]);

        path.enter().append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .merge(path)
            .attr("d", line);

        path.exit().remove();
    };

    // Update timeseries when feature is changed
    featureSelect.on("change", function() {
        const selectedDot = d3.selectAll(".team-dot[style*='stroke-width: 3']");
        if (selectedDot.empty()) return;
        const teamName = selectedDot.data()[0]['Team Name'];
        updateTimeseries(teamName);
    });

    // Function to handle click event on scatterplot dots
    window.handleDotClick = function(teamName) {
        updateTimeseries(teamName);
    };
});
