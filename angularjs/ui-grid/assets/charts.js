$(function () {
    google.charts.load('current', { packages: ['corechart', 'bar'] });
    google.charts.setOnLoadCallback(drawCharts);


    var allData = allData || {};
    allData.genderGap = [], allData.cni = [], allData.prs = [], allData.lob = [];
    //main function
    function drawCharts() {        
        var patientCnt = 0, totalAge = 0;

        //iterate data (from app.js) to add rows
        for (var item in jsonData) {
            var curItem = jsonData[item];

            var age = curItem.age;
            var gender = curItem.gender;
            var cni = curItem.cni;
            var prs = curItem.prs;
            var lob = curItem.lob;

            //console.log("typeof: "  + typeof (cni));

            patientCnt++;
            totalAge += age;

            genderGapData(age, gender, allData.genderGap);

            incrementData(cni, allData.cni);
            incrementData(prs, allData.prs);
            incrementData(lob, allData.lob);
        }


        //console.log(allData.genderGap);
        draw_patientCountChart(patientCnt);
        draw_ageChart(totalAge, patientCnt);
        draw_genderGapChart();
        draw_cniChart();
        draw_prsChart();
        draw_lobChart();
    }



    //Patient Count
    function draw_patientCountChart(cnt) {
        var _data = new google.visualization.DataTable();
        _data.addColumn('string', 'Patients');
        _data.addColumn('number', 'Count');
        _data.addColumn({ type: 'number', role: 'annotation' });
        _data.addRow(['', cnt, cnt]);

        var cntChart = new google.visualization.ColumnChart(
                            document.getElementById('patientCnt_chart'));

        //attach the error handler here, before draw()
        google.visualization.events.addListener(cntChart, 'error', errorHandler);

        cntChart.draw(_data, {
            title: 'Count of Patients',
            titleTextStyle: {
                fontSize: 18,
                color: '#053061',
            },
            legend: 'none',
            hAxis: {
                title: 'Demo Data',
                titleTextStyle: { fontSize: 14 }
            },
            vAxis: {
                title: 'No. of Patients'
            },
            animation: {
                "startup": true,
                duration: 700,
                easing: 'out'
            },
            colors: ['#222778']
        });
    }
    

    //Avg Age
    function draw_ageChart(totalAge, cnt) {
        var avgAge = totalAge / cnt;

        var _data = new google.visualization.DataTable();
        _data.addColumn('string', 'AvgAge');
        _data.addColumn('number', 'Value');
        _data.addColumn({ type: 'number', role: 'annotation' });
        _data.addRow(['', avgAge, avgAge]);

        var avgAgeChart = new google.visualization.ColumnChart(
                            document.getElementById('avgAge_chart'));

        //attach the error handler here, before draw()
        google.visualization.events.addListener(avgAgeChart, 'error', errorHandler);

        avgAgeChart.draw(_data, {
            title: 'Average Patient Age',
            titleTextStyle: {
                fontSize: 18,
                color: '#053061',
            },
            legend: 'none',
            hAxis: {
                title: 'Demo Data',
                titleTextStyle: { fontSize: 14 }
            },
            vAxis: {
                title: 'Average Age'
            },
            animation: {
                "startup": true,
                duration: 700,
                easing: 'out'
            },
            colors: ['#09ae83'],
        });
    }


    //Gender Gap
    //  --process gender gap data
    function genderGapData(age, gender, curObj) {
         if(isNull(curObj[age])){//object !exists
             curObj[age] = [];             
             curObj[age]['male'] = (gender == 'male') ? 1 : 0;
             curObj[age]['female'] = (gender != 'male') ? 1 : 0;
         }
         else {//already exists so increment
             var curVal = parseInt(curObj[age][gender]);
             curObj[age][gender] = curVal + 1;
         }
    }
    //  --draw chart
    function draw_genderGapChart() {
        var _data = new google.visualization.DataTable();
        _data.addColumn('string', 'AgeGroup');
        _data.addColumn('number', 'Female');
        _data.addColumn({ type: 'number', role: 'annotation' });
        _data.addColumn('number', 'Male');
        _data.addColumn({ type: 'number', role: 'annotation' });

        var min = 0, max = 0, most = 0, m, f, f2, fCnt = 0, mCnt = 0;
        var curObj = '', age = 0, ageRange = '';
        var arrParam = ['0-1', '2-5', '6-14', '15-24', '25-39', '40-60'];
        var arrData = makeArrData(arrParam, 2);

        //iterate initial data and put into age groups
        for (var key in allData.genderGap) {
            age = parseInt(key), ageRange = '';
            curObj = allData.genderGap[key];
            m = curObj['male'], f = curObj['female'];
            f2 = f * -1; //swap polarity of int

            if (age < 2) {
                ageRange = '0-1';
            }
            else if (age > 1 && age < 6) {
                ageRange = '2-5';
            }
            else if (age > 5 && age < 15) {
                ageRange = '6-14';
            }
            else if (age > 14 && age < 25) {
                ageRange = '15-24';
            }
            else if (age > 24 && age < 40) {
                ageRange = '25-39';
            }
            else if (age > 39 && age < 61) {
                ageRange = '40-60';
            }

            //make final array for _data.rows[]
            fCnt = arrData[ageRange][0];
            mCnt = arrData[ageRange][1];
            arrData[ageRange][0] = fCnt + f2;
            arrData[ageRange][1] = mCnt + m;
        }

        //now add data to chart
        for (var key in arrData) {
            curObj = arrData[key];
            fCnt = curObj[0], mCnt = curObj[1];
            f2 = fCnt * -1;

            //for hAxis lbls
            most = (mCnt > f2) ? mCnt : f2;
            max = (most > max) ? most : max;
            min = (max * -1);

            //add row here
            _data.addRow([key, fCnt, f2, mCnt, mCnt]);
        }

        //setup chart object from html elem
        var chartObj = new google.visualization.BarChart(
                            document.getElementById('genderGap_chart'));

        //  --for display labels
        max += 5; min -= 5;

        //attach the error handler here, before draw()
        google.visualization.events.addListener(chartObj, 'error', errorHandler);

        //format hover val for female count
        var formatter = new google.visualization.NumberFormat({ "pattern": " #; # " });
        formatter.format(_data, 1);

        //finally... draw(data, options)
        chartObj.draw(_data, {
            title: 'Gender Count',
            titleTextStyle: {
                fontSize: 18,
                color: '#053061',
            },
            hAxis: {
                title: 'Demo Data',
                titleTextStyle: { fontSize: 14 },
                viewWindow: {
                    max: max,
                    min: min,
                    gridlines: { count: 4 }
                },
                ticks: [{ v: min, f: max.toString() },
                        { v: 0 },
                        { v: max }]
            },
            vAxis: {
                title: 'Age Range'
            },
            animation: {
                "startup": true,
                duration: 700,
                easing: 'out'
            },
            isStacked: true,
            legend: 'top',
            colors: ['#7c91a4', '#0a62a9']
        });        
    }
        

    //Care Needs Index
    function draw_cniChart() {
        var _data = new google.visualization.DataTable();
        _data.addColumn('string', 'IndexGroup');
        _data.addColumn('number', '# of Patients');

        var arrParam = ['0-1', '1-2', '2-3', '3-4', '4-5'];
        var cniData = makeArrData(arrParam, 1);
        var cniCnt = '', cniRange = '';

        //iterate initial data and put into age groups
        for (var cni in allData.cni) {
            cniCnt = allData.cni[cni];
            cni = parseFloat(cni);

            if (cni < 0.9) {
                cniRange = '0-1';
            }
            else if (cni > 1 && cni < 2) {
                cniRange = '1-2';
            }
            else if (cni >= 2 && cni < 3) {
                cniRange = '2-3';
            }
            else if (cni >= 3 && cni < 4) {
                cniRange = '3-4';
            }
            else if (cni >= 4 && cni <= 5) {
                cniRange = '4-5';
            }

            //make final array for _data.rows[]
            cniData[cniRange][0] += cniCnt;
        }

        //now add data to chart
        for (var key in cniData) {
            cniCnt = cniData[key];
            
            //add row here
            _data.addRow([key, parseFloat(cniCnt)]);
        }

        //setup chart object from html elem
        var chartObj = new google.visualization.ColumnChart(
                            document.getElementById('cni_chart'));

        //attach the error handler here, before draw()
        google.visualization.events.addListener(chartObj, 'error', errorHandler);

        //finally... draw(data, options)
        chartObj.draw(_data, {
            title: 'Care Needs Index',
            titleTextStyle: {
                fontSize: 18,
                color: '#053061',
            },
            hAxis: {
                title: 'Demo Data',
                titleTextStyle: { fontSize: 14 },
            },
            vAxis: {
                title: 'No. of Patients',
                format: '#'
            },
            animation: {
                "startup": true,
                duration: 700,
                easing: 'out'
            },
            legend: 'none',
            colors: ['#149fbc']
        });        
    }
    

    //Predictive Risk Score
    function draw_prsChart() {
        var _data = new google.visualization.DataTable();
        _data.addColumn('string', 'IndexGroup');
        _data.addColumn('number', 'prs');
        var arrParam = ['0 - 0.2', '0.2 - 0.6', '0.6 - 1.0', '1.0 - 1.4', '1.4 - 2.0'];
        var prsData = makeArrData(arrParam, 1);
        var prsCnt = '', prsRange = '';

        //iterate initial data and put into age groups
        for (var prs in allData.prs) {
            prsCnt = allData.prs[prs];

            if (prs <= 0.2) {
                prsRange = '0 - 0.2';
            }
            else if (prs > 0.2 && prs <= 0.6) {
                prsRange = '0.2 - 0.6';
            }
            else if (prs > 0.6 && prs <= 1.0) {
                prsRange = '0.6 - 1.0';
            }
            else if (prs > 1.0 && prs <= 1.4) {
                prsRange = '1.0 - 1.4';
            }
            else if (prs > 1.4 && prs <= 2.0) {
                prsRange = '1.4 - 2.0';
            }

            console.log(prs + "\t" + prsCnt);
            console.log(prsRange);


            //make final array for _data.rows[]
            prsData[prsRange][0] += prsCnt;
        }

        //now add data to chart
        for (var key in prsData) {
            prsCnt = prsData[key];
            
            //add row here
            _data.addRow([key, parseFloat(prsCnt)]);
        }

        //setup chart object from html elem
        var chartObj = new google.visualization.ColumnChart(
                            document.getElementById('prs_chart'));

        //attach the error handler here, before draw()
        google.visualization.events.addListener(chartObj, 'error', errorHandler);

        //finally... draw(data, options)
        chartObj.draw(_data, {
            title: 'Predictive Risk Score',
            titleTextStyle: {
                fontSize: 18,
                color: '#053061',
            },
            hAxis: {
                title: 'Demo Data',
                titleTextStyle: { fontSize: 14 },
            },
            vAxis: {
                title: 'No. of Patients',
                format: '#'
            },
            animation: {
                "startup": true,
                duration: 700,
                easing: 'out'
            },
            legend: 'none',
            colors: ['#132fab']
        });        
    }
    



    function draw_lobChart() {
        //For a ColumnChart all columns(except the first) have to be of type number.
        var _data = allData.lob, ix = 0;
        var colors = ['#3366dd', '#40a134', '#73538d', '#ee8b18'];

        var lobData = new google.visualization.DataTable();
        lobData.addColumn('string', 'Line Of Business');
        lobData.addColumn('number', 'Count');
        lobData.addColumn({ type: 'number', role: 'annotation' });
        lobData.addColumn({ type: 'string', role: 'style' });        

        for (var key in _data) {
            var item = _data[key];
            lobData.addRow([key, item, item, colors[ix]]);
            ix++;
        }

        var lobChart = new google.visualization.ColumnChart(
                            document.getElementById('lob_chart'));

        //attach the error handler here, before draw()
        google.visualization.events.addListener(lobChart, 'error', errorHandler);

        lobChart.draw(lobData, {
            title: 'Patient Line of Business',
            titleTextStyle: {
                fontSize: 14,
                color: '#053061',
                bold: true,
            },
            hAxis: {
                title: 'Demo Data',
                textStyle: {
                    fontSize: 18,
                },
            },
            legend: 'none',
            animation: {
                "startup": true,
                duration: 700,
                easing: 'out'
            }
        });
    }



    //Helper Funcs
    //  --process+increment data
    function incrementData(key, curObj) {
         if(isNull(curObj[key])){
             curObj[key] = 1;
         }
         else {
             var curVal = parseInt(curObj[key]);
             curObj[key] = curVal + 1;
         }
    }

    function makeArrData(arrIn, cells) {
        var arrOut = [], key = '';
        for (var ix = 0; ix < arrIn.length; ix++) {
            key = arrIn[ix];
            arrOut[key] = (cells < 2)? [0] : [0, 0];
        }

        return arrOut;
    }

    //-- display console error and hide chart err from user
    function errorHandler(errorMessage) {
        //curisosity, check out the error in the console
        console.log(errorMessage);

        //simply remove the error, the user never see it
        google.visualization.errors.removeError(errorMessage.id);
    }
   

    
    $(window).resize(function () {
        drawCharts();
    });

});