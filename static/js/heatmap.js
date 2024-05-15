document.addEventListener("DOMContentLoaded", function() {
    const heatmapData = JSON.parse(rawData).heatmap;

    const teams = heatmapData.map(d => d['Team Name']);
    const uniqueTeams = Array.from(new Set(teams));

    const margin = {top: 0, right: 20, bottom: 125, left: 170},
          width = Math.max(800, uniqueTeams.length * 15),
          height = 700 - margin.top - margin.bottom;

    const svg = d3.select("#heatmap")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    const keys = Object.keys(heatmapData[0]).filter(key => key !== 'Team Name' && !key.includes('Unnamed'));

    const x = d3.scaleBand()
        .range([0, width])
        .domain(uniqueTeams)
        .padding(0.2);

    svg.append("g")
       .style("font-size", 10)
       .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
       .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    const y = d3.scaleBand()
        .range([height, 0])
        .domain(keys)
        .padding(0.2);

    svg.append("g")
       .style("font-size", 12)
       .call(d3.axisLeft(y));

    const keyMinMax = keys.reduce((acc, key) => {
        const values = heatmapData.map(d => d[key]);
        acc[key] = { min: d3.min(values), max: d3.max(values) };
        return acc;
    }, {});

    const tooltip = d3.select("#heatmap_tooltip");

    svg.selectAll("rect")
       .data(heatmapData.flatMap(d => keys.map(key => ({ 'Team Name': d['Team Name'], 'metric': key, 'value': d[key] }))))
       .enter()
       .append("rect")
        .attr("x", d => x(d['Team Name']))
        .attr("y", d => y(d.metric))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("class", d => `heatmap-cell ${d['Team Name'].replace(/\s+/g, '-')}`)
        .style("fill", d => {
            const colorScale = d3.scaleSequential()
                                .interpolator(d3.interpolateInferno)
                                .domain([keyMinMax[d.metric].min, keyMinMax[d.metric].max]);
            return colorScale(d.value);
        })
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", function(event, d) {
            console.log(d);
            // Show metric tooltip
            tooltip.style("opacity", 0.9)
                .style("display", "block");
            tooltip.html(`<i>${d['Team Name']}</i><br>${d.metric}:<br> ${d.value}`)
                .style("left", `${event.pageX + 20}px`)
                .style("top", `${event.pageY}px`);
            // Highlight team with outline and fill with heatmap color
            d3.selectAll(`.team-dot.${d['Team Name'].replace(/\s+/g, '-')}`)
                .style("r", 10)
                .style("fill", f => { 
                    const colorScale = d3.scaleSequential().interpolator(d3.interpolateInferno).domain([keyMinMax[d.metric].min, keyMinMax[d.metric].max]);
                    return colorScale(d.value)
                });
        })
        .on("mouseout", function(event, d) {
            tooltip.style("opacity", 0)
                .style("display", "none");
            d3.selectAll(`.team-dot.${d['Team Name'].replace(/\s+/g, '-')}`)
              .style("r", 5)
              .style("fill", 'grey');
              
        });

        svg.selectAll(".tick")
        .on("mouseover", function(event, key) {
            const isMetric = keys.includes(key);
            if (isMetric) {
                const colorScale = d3.scaleSequential()
                                     .interpolator(d3.interpolateInferno)
                                     .domain([keyMinMax[key].min, keyMinMax[key].max]);
 
                data.pca.forEach(d => {
                    if (d['Team Name'] === 'retired') {
                        return;
                    }
                    console.log(d);
                    console.log(key);
                    const teamValue = heatmapData.find(team => team['Team Name'] === d['Team Name'])[key];
                    d3.selectAll(`.team-dot.${d['Team Name'].replace(/\s+/g, '-')}`)
                        .style("fill", colorScale(teamValue))
                        .style("stroke", "none");;
                });
            } else {
                d3.selectAll(`.team-dot.${key.replace(/\s+/g, '-')}`)
                    .style("r", 10);
                d3.selectAll(`.heatmap-cell.${key.replace(/\s+/g, '-')}`)
                    .style("stroke", "black")
                    .style("stroke-width", 2);
            }
        })
        .on("mouseout", function(event, key) {
            const isMetric = keys.includes(key);
            if (isMetric) {
                d3.selectAll(".team-dot")
                    .style("fill", "grey")
                    .style("r", 5);
            } else {
                d3.selectAll(`.team-dot.${key.replace(/\s+/g, '-')}`)
                    .style("r", 5);
                d3.selectAll(`.heatmap-cell.${key.replace(/\s+/g, '-')}`)
                    .style("stroke", 'none');
            }
        });
 
});
