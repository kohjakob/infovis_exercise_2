document.addEventListener("DOMContentLoaded", function() {
    const pcaData = data.pca;
    const heatmapData = JSON.parse(rawData).heatmap;

    const margin = {top: 20, right: 20, bottom: 20, left: 20},
          width = 700 - margin.left - margin.right,
          height = 700 - margin.top - margin.bottom;

    const svg = d3.select("#scatterplot")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const xScale = d3.scaleLinear()
                     .domain(d3.extent(pcaData, d => d.PC1))
                     .range([0, width]);
    const yScale = d3.scaleLinear()
                     .domain(d3.extent(pcaData, d => d.PC2))
                     .range([height, 0]);

    const tooltip = d3.select("#scatterplot_tooltip");
    const infoBox = d3.select("#info_box");

    // Task 5.1: 'By hovering over a dot in the PCA scatterplot, highlight the corresponding team/player on the heatmap (up to 5 points). '
    svg.selectAll("circle")
       .data(pcaData)
       .enter()
       .append("circle")
       .attr("cx", d => xScale(d.PC1))
       .attr("cy", d => yScale(d.PC2))
       .attr("r", 5)
       .attr("class", d => `team-dot ${d['Team Name'].replace(/\s+/g, '-')}`)
       .style("fill", "grey")
       .style("cursor", "pointer")
       // Show tooltip and highlight team dot and heatmap cell 
       .on("mouseover", function(event, d) {
            tooltip.html(`<i>${d['Team Name']}</i>`)
                .style("left", `${event.pageX + 20}px`)
                .style("top", `${event.pageY}px`)
                .style("opacity", 0.8)
                .style("display", "block");
            d3.selectAll(`.team-dot.${d['Team Name'].replace(/\s+/g, '-')}`)
                .style("r", 10);
            d3.selectAll(`.heatmap-cell.${d['Team Name'].replace(/\s+/g, '-')}`)
                .style("stroke", "black")
                .style("stroke-width", 3);
            // Show info box
            const teamData = heatmapData.find(team => team['Team Name'] === d['Team Name']);
            if (teamData) {
                let infoHtml = `<strong>${teamData['Team Name']}</strong><br>`;
                Object.keys(teamData).forEach(key => {
                    if (key !== 'Team Name' && !key.includes('Unnamed')) {
                        infoHtml += `${key}: ${teamData[key]}<br>`;
                    }
                });
                infoBox.html(infoHtml)
                       .style("display", "block");
            }
       })
       // Hide tooltip and remove hover effects on team dot and heatmap cell
       .on("mouseout", function(event, d) {
            tooltip.style("opacity", 0)
                .style("display", "none");
            d3.selectAll(`.team-dot.${d['Team Name'].replace(/\s+/g, '-')}`)
                .style("r", 5);
            d3.selectAll(`.heatmap-cell.${d['Team Name'].replace(/\s+/g, '-')}`)
                .style("stroke", "none");
            infoBox.style("display", "none");
       })
       // Add click handler to update timeseries chart
       .on("click", function(event, d) {
            const teamName = d['Team Name'];
            d3.selectAll(".team-dot").style("r", 5).style("stroke-width", 0); // Reset all dots to original size
            d3.select(this)
              .style("stroke", "red")
              .style("stroke-width", 3);
            handleDotClick(teamName);
       });
});
