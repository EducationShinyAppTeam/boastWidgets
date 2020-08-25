HTMLWidgets.widget({

  name: 'radialPoll',

  type: 'output',

  factory: function(el, width, height) {

    // Define shared variables for this instance
    const innerWidth = 954;
    const innerHeight = 350;
    const innerRadius = 110;
    const outerRadius = innerWidth / 3;
    const pointRadius = innerRadius / 20;
    const pointPadding = pointRadius;
    const handleRadius = 13;

    return {

      renderValue: function(x) {

        console.log(x);

        // @todo: set display options to false

        // Configurable options
        const options = x.options ? x.options : '';
        const maxVotes = options.maxVotes ? options.maxVotes : 1;
        const displayAngle = options.display && options.display.angle !== undefined ? options.display.angle : true;
        const displayControls = options.display && options.display.controls !== undefined ? options.display.controls : true;

        // Plot data
        let data = x.data;

        // Max votes per ring - 13 rings total
        const ringMax = [25, 27, 30, 33, 36, 40, 43, 46, 49, 52, 54, 57, 60];
        const slots = generateSlots();
        const choices = setChoices(options.choices);

        let totalVotes = data.length;
        let userVotes = 0;

        let handlePos = [{
          angle: 90,
          absoluteValue: 159,
          label: 'handle'
        }];

        let angleIndicator = function(value = 90) {
          let wrapper = document.createElement("div");
              wrapper.className = "angle";
              wrapper.innerHTML = "Angle: ";
          let deg = document.createElement("span");
              deg.className = "deg";
              deg.innerHTML = value;

          wrapper.appendChild(deg);

          return wrapper;
        }

        let controls = function(display = true) {
          let wrapper = document.createElement("div");
              wrapper.className = "poll-instructions";

          if(display) {
            let controls = document.createElement("div");
              controls.className = "poll-control-guide";
              controls.innerHTML =
              `<strong>Keyboard Controls:</strong>
                <ul>
                  <li><kbd>Arrow Right</kbd>: +5</li>
                  <li><kbd>Arrow Up</kbd>: +1</li>
                  <li><kbd>Arrow Left</kbd>: -5</li>
                  <li><kbd>Arrow Down</kbd>: -1</li>
                  <li><kbd>Enter</kbd>: Submit</li>
                </ul>
                <p><strong>Note:</strong> to use controls, you must tab into the poll first.</p>`;

            wrapper.appendChild(controls);
          }

          return wrapper;
        }

        const svg = d3.select(el)
          .append("svg")
          .attr("viewBox", [- innerWidth / 2.839285714, - handleRadius - 2.25, innerWidth / 1.423880597, innerHeight])
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("style", "transform:rotate(180deg)");

        y = d3.scaleLinear()
          .domain([0, 20])
          .range([innerRadius, outerRadius]);

        yAxis = g => g
          .attr("text-anchor", "middle")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .call(g => g.selectAll("g")
            .data(y.ticks(1))
            .join("g")
            .attr("fill", "none")
            .attr('class', 'radial')
            .call(g => g.append("circle")
              .attr("stroke", "#CCC")
              .attr("r", y)));

        svg.append("g")
          .call(yAxis);

        var votes = svg.append('g')
          .attr('id', 'votes');

        drawVotes();

        var choiceGroup = svg.append('g')
          .attr('id', 'choices');

        var handle = svg.append('g')
          .attr('id', 'handle')
          .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

        var angularScale = d3.scaleLinear().range([0, 180]).domain([0, outerRadius]);

        function drawVotes() {
          var group = votes.selectAll('circle').data(slots);

          group
            .enter()
            .append('circle')
            .attr('class', 'vote')
            .attr('id', function(d){
              return 'slot-' + d.index // @todo: add uuid prefix uuid-slot-index
            })
            .attr('r', pointRadius)
            .attr('cx', getCX)
            .attr('cy', getCY);

          group.transition().attrTween("cx", function(d){
            this.setAttribute('cx', getCX(d));
            this.setAttribute('cy', getCY(d));
          });

          group.exit().remove();
        }

        /* Generate possible slots for votes to occupy */
        function generateSlots() {
          let slots = [];
          let count = 0;
          for (let i = 0; i < ringMax.length; i++) {
            let scalar = 180 / (ringMax[i] - 1);
            for(let j = 0; j < ringMax[i]; j++){
              count++;
              let slot = {
                'index': count,
                'pos': j,
                'deg': j * scalar,
                'ring': i + 1,
                'filled': false
              }
              slots.push(slot);
            }
          }
          return slots;
        }

        /* Fill slots for a given set of data (typically from a database or other storage) */
        function fillSlots(data) {
         for (const vote of data) {
           let slot = findSlot(vote.deg);
           fillSlot(slot);
         }
        }

        /* Set given slot to be filled in and unavailable for future votes */
        function fillSlot(slot, highlight = false) {
          let index = slots.indexOf(slots.find(({
            index
          }) => index === slot)); // @todo: fix this jank

          if (index >= 0 && !slots[index].filled) {
            slots[index].filled = true;
            let el = document.getElementById('slot-' + slot);
                el.classList.add('filled');
            if (highlight) {
              el.classList.add('highlight');
            }
          }
        }

        /* Find the closest open slot based on value provided */
        function findSlot(value) {
          let slot = -1;
          let possibilities = findSlots(value);

          if (possibilities.length > 0) {
            slot = possibilities[0].index;
          }

          return slot;
        }

        /* Find all closest open slots based on value provided */
        function findSlots(value) {
          let possibilities = slots.filter(
            function (slot) {
              let scalar = (180 / (ringMax[0] - 1)) / 2;
              if ((slot.deg >= value - scalar) && (slot.deg <= value + scalar) && !slot.filled) {
                return true;
              }
              return false;
            }
          ).sort((a, b) => a.ring - b.ring); // Sort from inner ring to outer ring.

          return possibilities;
        }

        /* Setup vote choice labels */
        function setChoices (choices) {

          // We must have at least two options for a meaningful vote
          const count = choices.length >= 2 && typeof (choices) == "object" ? choices.length : 2;

          // Split hemicycle into equal parts
          const offset = 180 / (count - 1);

          let values = [];

          for(i = 0; i < count; i++){
            values.push({
              angle: i * offset, // 0 <= N <= 180
              label: String.fromCharCode(65 + i) // 'A' + current index
            })
          }

          return values;
        }

        /* Circle X position */
        function getCX(d) {
          ringOffset = (d.ring - 1) * (pointRadius * 2.25) + pointPadding;
          radians = (d.deg / 180) * Math.PI;
          cx = (innerRadius + ringOffset * 1.15) * Math.cos(radians);
          return cx;
        }

        /* Circle Y position */
        function getCY(d) {
          ringOffset = (d.ring - 1) * (pointRadius * 2.25) + pointPadding;
          radians = (d.deg / 180) * Math.PI;
          cy = (innerRadius + ringOffset * 1.15) * Math.sin(radians);
          return cy;
        }

        /* Draw choices (A vs B) for user to vote on */
        function drawChoices() {
          var join = choiceGroup.selectAll('circle').data(choices);

          /* Choices */
          join.enter()
            .append('circle')
            .attr('r', handleRadius + 2)
            .attr('class', 'choice')
            .attr('style', function (d) {
              return 'transform:rotate(' + angularScale(angularScale.invert(d.angle)) + 'deg) translate(' + outerRadius + 'px, 0)';
            });

          /* Labels for choices */
          join.enter()
            .append('text')
            .text(function (d) {
              return d.label;
            })
            .attr('style', function (d) {
              let rotation = angularScale(angularScale.invert(d.angle));
              return 'transform:rotate(' +
                rotation + 'deg)' +
                'translate(' + (outerRadius) + 'px, ' + 0 + 'px)' +
                'rotate(' + (180 - rotation) + 'deg)';
            });
        }

        /* Draw slider handle for voting */
        function drawHandles() {
          var join = handle.selectAll('circle').data(handlePos);

          var drag = d3.drag()
            .subject(function (d) {
              /* Pass the wrapper element for later reference */
              d.parent = join._parents[0].parentNode.parentNode;
              return d;
            })
            .on("drag", dragMove)
            .on("end", dragEnd);

          join.enter()
            .append('circle')
            .attr('r', handleRadius)
            .attr('class', 'handle')
            .attr('tabindex', '0')
            .attr('style', function (d) {
              return 'transform:rotate(90deg) translate(' + outerRadius + 'px, 0)';
            })
            .on("keydown", function(d) {
              var key = d3.event.keyCode;

              // if: Right +5 or Up +1; else if: Left -5 or Down -1
              if(key == 39) {
                moveHandle(d, d.angle + 5);
              } else if(key == 37) {
                moveHandle(d, d.angle - 5);
              } else if (key == 38) {
                moveHandle(d, d.angle + 1);
              } else if (key == 40) {
                moveHandle(d, d.angle - 1);
              } else if (key == 13) {
                dragEnd(d)
              }
            })
            .on("mouseover", function () {
              d3.select(this).classed('active', true);
            })
            .on("mouseout", function () {
              d3.select(this).classed('active', false);
            }).call(drag);

          join.attr('style', function (d) {
            return 'transform:rotate(' + angularScale(d.absoluteValue) + 'deg) translate(' + outerRadius + 'px, 0)';
          });
        }

        /* Slider handle drag move event handler */
        function dragMove(handle) {

          if (!this.classList.contains('disabled')) {

            /* Get cursor event coordinates */
            var coordinates = d3.mouse(svg.node());

            /**
             * Adjust coordinates to fix browser discrepancies
             * @see {@link https://github.com/d3/d3-selection/issues/95}
             */
            var relativeHeight = handle.parent.offsetHeight + handle.parent.offsetTop - handleRadius;
            var relativeX = d3.event.sourceEvent.clientX - handle.parent.offsetLeft;
            var clientY = d3.event.sourceEvent.clientY;

            // @todo: origin may shift if browser resizes
            handle.origin = handle.origin ? handle.origin : relativeX;

            /* Ignore reported sign of mouseevent.offsetX and substitute our own */
            var x = Math.abs(coordinates[0]) * (handle.origin < relativeX ? -1 : 1);

            /**
             * if: cursor extends beyond element's height; ignore.
             * else: take absolute value
             */
            var y = clientY > relativeHeight ? 0 : Math.abs(coordinates[1]);

            /* angle = arctan(x,y) * 1 radian degrees */
            var angle = Math.atan2(y, x) * (180 / Math.PI);

            moveHandle(handle, angle);
          } else {
            //document.getElementById("warning").innerHTML = "Only <strong>" + maxVotes + "</strong> vote permitted.";
          }
        }

        /* Slider handle drag move ended event handler */
        function dragEnd(handle) {
          if (userVotes < maxVotes) {
            let slot = findSlot(handle.angle);

            console.log(handle);
            userVotes++;
            totalVotes++;

            fillSlot(slot, true);
            disableHandle(this);
            updateVoteCounter();
          }
        }

        // @todo: fix keyboard controls
        function disableHandle(handle) {
          handle.classList.add('disabled');
        }

        /* Set a given slider's handle position by given degrees */
        function moveHandle(handle, angle) {

          /* Store values in object for reference */
          handle.angle = angle;
          handle.absoluteValue = angularScale.invert(angle);

          if(displayAngle) {
            el.querySelector('.deg').innerText = Math.round(angle);
          }

          drawHandles();
        }

        /* Set vote counter element to total number of votes */
        function updateVoteCounter() {
          //document.getElementById("vote-counter").innerHTML = totalVotes;
        }

        /* @todo: switch this to render element if enabled instead */
        if(displayAngle) {
          el.appendChild(angleIndicator(handlePos[0].angle));
        }

        if(displayControls) {
          el.appendChild(controls(displayControls));
        }

        fillSlots(data);
        drawChoices();
        drawHandles();
        updateVoteCounter();

      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});
