import { getFolderItems, getFile, hideAnimation, showError, disableCheckBox, convertTextToJson, uploadFile, getFileJSON, csvJSON, csv2Json, showAnimation } from '../shared.js';
import { studyDropDownTemplate } from '../components/elements.js';
import { txt2dt } from '../visualization.js';
import { addEventStudiesCheckBox, addEventDataTypeCheckBox, addEventSearchDataType, addEventSearchStudies, addEventSelectAllStudies, addEventSelectAllDataType } from '../event.js';
import { variables } from '../variables.js';

export const template = () => {
    return `
        <div class="main-summary-row data-exploration-div">
            <div class="main-summary-row statistics-row">
                <ul class="nav nav-tabs">
                    <li class="nav-item">
                        <a class="nav-link active" href="#data_exploration/summary"><strong>Summary statistics</strong></a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#data_exploration/missing"><strong>Missingness statistics</strong></a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="main-summary-row" id="dataSummaryStatistics"></div>
    `;
}

export const dataSummaryStatisticsTemplate = () => `
    <div class="col-xl-2 margin-bottom">
        <div class="card sub-div-shadow">
            <div class="card-header">
                <strong class="side-panel-header">Studies 
                    <button class="info-btn" aria-label="More info" data-keyboard="false" data-backdrop="static" data-toggle="modal" data-target="#confluenceMainModal" id="dataSummaryFilter"><i class="fas fa-question-circle cursor-pointer"></i></button>
                </strong>
            </div>
            <div id="cardContent" class="card-body">
                <div id="genderFilter" class="align-left"></div>
                <div id="chipContent" class="align-left"></div>
                <div id="studyFilter" class="align-left"></div>
            </div>
        </div>
    </div>
    <div class="col-xl-10">
        <div class="main-summary-row">
            <div class="data-exploration-charts col-xl-4">
                <div id="chartDiv7">
                    <div class="card sub-div-shadow">
                        <div class="card-header">
                            <span class="data-summary-label-wrap"><label class="dataSummary-label" id="dataSummaryVizLabel7"></label></span>
                        </div>
                        <div class="card-body viz-card-body">
                            <div class="dataSummary-chart" id="dataSummaryVizChart7"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="data-exploration-charts col-xl-4">
                <div id="chartDiv2">
                    <div class="card sub-div-shadow">
                        <div class="card-header">
                            <span class="data-summary-label-wrap"><label class="dataSummary-label" id="dataSummaryVizLabel2"></label></span>
                        </div>
                        <div class="card-body viz-card-body">
                            <div class="dataSummary-chart" id="dataSummaryVizChart2"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="data-exploration-charts col-xl-4">
                <div id="chartDiv5">
                    <div class="card sub-div-shadow">
                        <div class="card-header">
                            <span class="data-summary-label-wrap"><label class="dataSummary-label" id="dataSummaryVizLabel5"></label></span>
                        </div>
                        <div class="card-body viz-card-body">
                            <div class="dataSummary-chart" id="dataSummaryVizChart5"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="main-summary-row">
            <div class="data-exploration-charts col-xl-4">
                <div id="chartDiv3">
                    <div class="card sub-div-shadow">
                        <div class="card-header">
                            <span class="data-summary-label-wrap"><label class="dataSummary-label" id="dataSummaryVizLabel3"></label></span>
                        </div>
                        <div class="card-body viz-card-body">
                            <div class="dataSummary-chart" id="dataSummaryVizChart3"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="data-exploration-charts col-xl-4">
                <div id="chartDiv6">
                    <div class="card sub-div-shadow">
                        <div class="card-header">
                            <span class="data-summary-label-wrap"><label class="dataSummary-label" id="dataSummaryVizLabel6"></label></span>
                        </div>
                        <div class="card-body viz-card-body">
                            <div class="dataSummary-chart" id="dataSummaryVizChart6"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="data-exploration-charts col-xl-4">
                <div id="chartDiv4">
                    <div class="card sub-div-shadow">
                        <div class="card-header">
                            <span class="data-summary-label-wrap"><label class="dataSummary-label" id="dataSummaryVizLabel4"></label></span>
                        </div>
                        <div class="card-body viz-card-body">
                            <div class="dataSummary-chart" id="dataSummaryVizChart4"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`

export const dataSummaryMissingTemplate = async () => {
    const response = await getFile('653087731560');
    const {data, headers} = csv2Json(response);
    
    const div1 = document.createElement('div');
    div1.classList = ['main-summary-row'];
    div1.id = 'missingnessFilter';

    const div2 = document.createElement('div');
    div2.classList = ['main-summary-row'];
    div2.id = 'missingnessTable';

    document.getElementById('dataSummaryStatistics').appendChild(div1);
    document.getElementById('dataSummaryStatistics').appendChild(div2);

    const initialSelection = ['ER_statusIndex_Data available', 'ageInt_Data available', 'ethnicityClass_Data available', 'famHist_Data available', 'contrType_Data available']
    renderFilter(data, initialSelection.sort(), headers.sort());
    midset(data, initialSelection.sort());
}

const addEventMissingnessVariableChange = (data, headers) => {
    const select = document.getElementById('dataMissingnessVariables');
    select.addEventListener('change', () => {
        const selectedVariables = [];
        Array.from(select.options).forEach(option => {
            if(option.selected) selectedVariables.push(option.value)
        });
        showAnimation();
        midset(data, selectedVariables, headers);
    });
}

const renderFilter = (data, acceptedVariables, headers) => {
    let template = '';
    template += '<div class="main-summary-row">'
    template += `<div class="form-group">
                    <label for="dataMissingnessVariables">Multiple select variable</label>
                    <select multiple class="form-control" id="dataMissingnessVariables">`
    headers.forEach(variable => {
        template += `<option ${acceptedVariables.indexOf(variable) !== -1 ? 'selected': ''} value="${variable}">${variable.replace('_Data available', '')}</option>`
    });
    template += '</select></div></div>'
    document.getElementById('missingnessFilter').innerHTML = template;
    addEventMissingnessVariableChange(data, headers);
}

const midset = (data, acceptedVariables) => {
    let template = '';
    let plotData = '';
    if(data.length > 0){
        template += '<table class="table table-hover table-borderless missingness-table table-striped"><thead>';
        const headerCount = computeHeader(data, acceptedVariables);
        const result = computeSets(data, acceptedVariables);
        template += `<tr><th class="missing-column"></th>`
        for(let variable in headerCount) {
            template += `<th class="missing-column">${headerCount[variable]}</th>`
        }
        template += `<th class="missing-column"></th></tr><tr><td class="missing-column"></td>`;
        for(let variable in headerCount) {
            template += `<th class="missing-column">${variable.replace('_Data available', '')}</th>`
        }
        template += '<th></th></tr></thead><tbody><tr><td class="missing-column">No set</td>';
        // const set0 = computeSet0(data, acceptedVariables);
        const set0 = data.length;
        acceptedVariables.forEach((variable, index) => {
            template += `<td class="missing-column">&#9898</td>`;
            if(index === acceptedVariables.length - 1) template += `<td class="missing-column">${set0}</td><td id="midsetChart" rowspan="${Object.keys(result).length + 1}"></td>`;
        });
        template += '</tr>';
        plotData = Object.values(result);
        plotData.unshift(set0);

        let variableDisplayed = {};
        for(let key in result) {
            const allVariables = key.split('@#$');
            const firstVar = key.split('@#$')[0];
            template += '<tr>';
            if(variableDisplayed[firstVar] === undefined) {
                template += `<td class="missing-column">${firstVar.replace('_Data available', '')}</td>`;
                variableDisplayed[firstVar] = '';
            }else {
                template += '<td class="missing-column"></td>'
            }
            acceptedVariables.forEach((variable, index) => {
                if(variable === firstVar) {
                    template += '<td class="missing-column">&#9899</td>'
                }
                else if(variable !== firstVar && allVariables.indexOf(variable) !== -1){
                    template += '<td class="missing-column">&#9899</td>'
                }
                else if(variable !== firstVar && allVariables.indexOf(variable) === -1){
                    template += '<td class="missing-column">&#9898</td>'
                }
                if(index === acceptedVariables.length - 1) {
                    template += `<td class="missing-column">${result[key]}</td>`
                }
            });
            template += '</tr>';
        }
        
        template += '<tbody></table>';
    }
    hideAnimation();
    document.getElementById('missingnessTable').innerHTML = template;
    renderMidsetPlot(plotData.reverse(), 'midsetChart');
}

const renderMidsetPlot = (x, id) => {
    const data = [{
        type: 'bar',
        x: x,
        hoverinfo: 'x',
        orientation: 'h',
        marker: {
            color: '#ef71a8'
        }
    }];

    const layout = {
        xaxis: {
            showgrid: false,
            fixedrange: true
        },
        yaxis: {
            autorange: true,
            showgrid: false,
            zeroline: false,
            showline: false,
            autotick: true,
            ticks: '',
            showticklabels: false,
            fixedrange: true
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0,
            pad: 0
        }
    }

    const options = {
        responsive: true, 
        displayModeBar: false
    }
    Plotly.newPlot(id, data, layout, options);
}

const computeSets = (data, acceptedVariables) => {
    let obj = {};
    const allCombinations = getCombinations(acceptedVariables);
    allCombinations.forEach(combination => {
        const setLength = setLengths(data, combination.split('@#$'));
        if(setLength > 0) {
            obj[combination] = setLength;
        }
    });
    return obj;
}

const setLengths = (data, arr) => {
    arr.forEach(variable => {
        if(variable) {
            data = data.filter(dt => dt[variable] === '1');
        }
    });
    return data.length
}

const getCombinations = (chars) => {
    const result = [];
    const f = (prefix, chars) => {
        for (var i = 0; i < chars.length; i++) {
            const str = `${prefix}${prefix ? '@#$': ''}${chars[i]}`;
            result.push(str);
            f(str, chars.slice(i + 1));
        }
    }
    f('', chars);
    return result;
}

const computeHeader = (data, acceptedVariables) => {
    let obj = {};
    acceptedVariables.forEach(variable => {
        obj[variable] = data.filter(dt => dt[variable] === '1').length;
    });
    return obj;
}

const computeSet0 = (data, acceptedVariables) => {
    acceptedVariables.forEach(variable => {
        data = data.filter(dt => dt[variable] === '0');
    });
    return data.length
}

const dataBinning = async () => {
    const fileId = 558252350024;
    const response = await getFileJSON(fileId);
    const newArray = [];
    response.forEach(obj => {
        const age = parseInt(obj.ageInt)
        let range = '';
        if(age >= 0 && age <= 9) range = '0-9';
        if(age >= 10 && age <= 19) range = '10-19';
        if(age >= 20 && age <= 29) range = '20-29';
        if(age >= 30 && age <= 39) range = '30-39';
        if(age >= 40 && age <= 49) range = '40-49';
        if(age >= 50 && age <= 59) range = '50-59';
        if(age >= 60 && age <= 69) range = '60-69';
        if(age >= 70 && age <= 79) range = '70-79';
        if(age >= 80 && age <= 89) range = '80-89';
        if(age >= 90 && age <= 99) range = '90-99';
        if(age >= 100 && age <= 109) range = '100-109';
        if(age >= 110 && age <= 119) range = '110-119';
        newArray.push({
            consortium: obj.consortium,
            status: obj.status,
            ageInt: range,
            ethnicityClass: obj.ethnicityClass,
            famHist: obj.famHist,
            fhnumber: obj.fhnumber,
            study: obj.study,
            ER_statusIndex: obj.ER_statusIndex
        })
    })
    // uploadFile(newArray, 'summary_data.json', 100898103650);
}

const generateConfluenceSummaryLevelData = async () => {
    const fs = JSON.parse(localStorage.data_summary);
    const obj = {};
    const sentries = fs[89412660666].studyEntries;
    for(const data in sentries){
        const dentries = sentries[data].dataEntries;
        for(let ds in dentries){
            const fileEntries = dentries[ds].fileEntries;
            for(const id in fileEntries){
                obj[id] = {};
                obj[id].name = fileEntries[id].name;
                obj[id].type = 'file';
            }
        }
    }
    
    const jsonData = await convertTextToJson(obj);
    
    const summaryData = jsonData.map(data => { return { BCAC_ID: data.BCAC_ID, status: data.status, ageInt: data.ageInt, ethnicityClass: data.ethnicityClass, famHist: data.famHist, fhnumber: data.fhnumber, study: data.study, ER_statusIndex: data.ER_statusIndex}})
    uploadFile(summaryData, 'summary_data.json', 92639258921);
}

export const countSpecificStudy = (folderId) => {
    const studyOption = document.getElementById('studyOption');
    studyOption.hidden = false;
    let dataObject = JSON.parse(localStorage.data_summary);
    let studyEntries = '';
    if(dataObject[folderId]){
        studyEntries = dataObject[folderId].studyEntries;
        let studiesList = document.getElementById('studiesList');
        studiesList.innerHTML = studyDropDownTemplate(studyEntries, 'studyOptions');
        document.getElementById('studyCount').textContent = Object.keys(studyEntries).length
    };

    addEventStudiesCheckBox(dataObject, folderId);

    // Select first study by default and trigger event
    const studiesCheckBox = document.getElementsByName('studiesCheckBox');
    let index = 0;
    if(Object.keys(dataObject[folderId].studyEntries).length === 0 ) {
        hideAnimation();
        return;
    }
    if(dataObject[folderId].studyEntries && Object.keys(dataObject[folderId].studyEntries[studiesCheckBox[index].value].dataEntries).length > 0){
        studiesCheckBox[index].checked = true;
        studiesCheckBox[index].dispatchEvent(new Event('click'));
    }
    else{
        studiesCheckBox[index].checked = true;
        showError('No Data Found in this study!');
        hideAnimation();
    }
    addEventSearchStudies();

    addEventSelectAllStudies(studyEntries);
};

export const countSpecificData = async (selectedValues, studyEntries) => {
    const dataDropDown = document.getElementById('dataDropDown');
    dataDropDown.hidden = false;
    let template = '';
    let dataCounter = 0;
    let checker_obj = {};

    selectedValues.forEach(studyId => {
        const intStudyId = parseInt(studyId);
        if(studyEntries[intStudyId]){
            if(selectedValues.length === 1 && Object.keys(studyEntries[intStudyId].dataEntries).length === 0) {
                showError('No Data Found in this study!');
                hideAnimation();
                disableCheckBox(false); 
                return;
            }
            const dataEntries = studyEntries[intStudyId].dataEntries;
            dataCounter += Object.keys(dataEntries).length;
            for(let dataId in dataEntries){
                if(checker_obj[dataEntries[dataId].name.toLowerCase().trim()]) return;
                checker_obj[dataEntries[dataId].name.toLowerCase().trim()] = {};
                template += `<li>
                                <label><input type="checkbox" class="chk-box-margin" name="dataTypeCheckBox" data-study-id="${selectedValues.toString()}" value="${dataEntries[dataId].name}"/>${dataEntries[dataId].name}</label>
                            </li>`;
            }
        }
    });

    let dataTypeList = document.getElementById('dataTypeList');
    dataTypeList.innerHTML = template;

    // Add event listener to data type check box list
    addEventDataTypeCheckBox(studyEntries);
    addEventSelectAllDataType(studyEntries);
    
    // Select first data type by default and trigger event
    if(selectedValues.length > 0){
        const dataTypeCheckBox = document.getElementsByName('dataTypeCheckBox');
        dataTypeCheckBox[0] ? dataTypeCheckBox[0].checked = true : showError('No Data Found in this study!');
        dataTypeCheckBox[0] ? dataTypeCheckBox[0].dispatchEvent(new Event('click')) : '';
    }else{
        document.getElementById('dataDropDown').hidden = true;
    }
    
    document.getElementById('dataCount').textContent = dataCounter;
    
    // Data type search/filter Event
    addEventSearchDataType();
};

const getAgeDataForAllStudies = async (studyEntries) => {
    let obj = {
        age:[],
        ethnicity : []
    }
    for(const study of studyEntries){
        const studyId = study.id;
        const folderData = await getFolderItems(studyId);
        const folderEntries = folderData.entries;
        
        for(const data of folderEntries){
            if(data.name.toLowerCase().trim() === 'core data'){
                const dataId = data.id;
                const dataContent = await getFolderItems(dataId);
                const dataEntries = dataContent.entries;
                for(const fileData of dataEntries){
                    const fileId = fileData.id;
                    const fileContent = await getFile(fileId);
                    const fileDt = txt2dt(fileContent).tab;
                    obj.age = obj.age.concat(fileDt.ageInt);
                    obj.ethnicity = obj.ethnicity.concat(fileDt.ethnicityClass)
                };
            };
        };
    };
};

export const clearGraphAndParameters = () => {
    document.getElementById('dataSummaryVizBarChart').innerHTML = '';
    document.getElementById('dataSummaryVizPieChart').hidden = true;
    document.getElementById('dataSummaryVizChart2').innerHTML = '';
    document.getElementById('barChartLabel').innerHTML = '';
    document.getElementById('pieChartLabel').innerHTML = '';
    document.getElementById('statusPieChart').innerHTML = '';
}

export const unHideDivs = () => {
    document.getElementById('dataSummaryVizPieChart').hidden = false;
}
