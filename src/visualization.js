import { hideAnimation, getFile, csvJSON, numberWithCommas, summaryStatsFileId, getFileInfo, mapReduce } from './shared.js';
import { variables } from './variables.js';
import { addEventSummaryStatsFilterForm } from './event.js';
const plotTextSize = 10;

const chartLabels = {
    'yes': 'Yes',
    'no': 'No',
    'DK': 'Don\'t know',
    'pos': 'Positive',
    'neg': 'Negative'
}

export const getFileContent = async () => {
    const {jsonData, headers} = csvJSON(await getFile(summaryStatsFileId)); // Get summary level data
    const lastModified = (await getFileInfo(summaryStatsFileId)).modified_at;
    document.getElementById('dataLastModified').innerHTML = `Data last modified at - ${new Date(lastModified).toLocaleString()}`;
    hideAnimation();
    if(jsonData.length === 0) {
        document.getElementById('confluenceDiv').innerHTML = `You don't have access to summary level data, please contact NCI for the access.`
        return;
    }
    renderAllCharts(jsonData, headers, true);
};

const allFilters = (jsonData, headers) => {
    document.getElementById('allFilters').innerHTML = '';
    const div1 = document.createElement('div')
    div1.classList = ['row gender-select'];
    let template =`
        <div style="width: 100%;">
            <div class="form-group">
                <label class="filter-label font-size-13" for="genderSelection">Gender</label>
                <select class="form-control font-size-15" id="genderSelection" data-variable='sex'>
                    <option selected value='all'>All</option>
                    <option value='female'>Female</option>
                    <option value='male'>Male</option>
                </select>
            </div>
            <div class="form-group">
                <label class="filter-label font-size-13" for="genotypingChipSelection">Genotyping chip</label>
                <select class="form-control font-size-15" id="genotypingChipSelection" data-variable='chip'>
                    <option selected value='all'>All Arrays</option>
                    <option value='Confluence chip'>Confluence Array</option>
                    <option value='Other chip'>Other Array</option>
                </select>
            </div>
    `;
    template += `<label class="filter-label font-size-13" for="studyConsortiaList">Studies</label>`
    const obj = aggegrateData(jsonData);
    for(let consortium in obj){
        let innerTemplate = `
                    <ul class="remove-padding-left font-size-15" id="studyConsortiaList">
                        <li class="custom-borders filter-list-item">
                            <button type="button" class="consortium-selection consortium-selection-btn" data-toggle="collapse" href="#toggle${consortium.replace(/ /g, '')}">
                                <i class="fas fa-caret-down"></i>
                            </button>
                            <input type="checkbox" data-consortia="${consortium}" id="label${consortium}" class="select-consortium"/>
                            <label for="label${consortium}" class="consortia-name">${consortium}</label>
                            <div class="ml-auto">
                                <div class="filter-btn custom-margin consortia-total" data-consortia='${consortium}'>
                                    ${numberWithCommas(obj[consortium].consortiumTotal)}
                                </div>
                            </div>
                        </li>
                        <ul class="collapse no-list-style custom-padding allow-overflow max-height-study-list" id="toggle${consortium.replace(/ /g, '')}">`;
        for(let study in obj[consortium]){
            if(study !== 'consortiumTotal') {
                const total = obj[consortium][study].total;
                innerTemplate += `<li class="filter-list-item">
                                <input type="checkbox" data-study="${study}" data-consortium="${consortium}" id="label${study}" class="select-study"/>
                                <label for="label${study}" class="study-name" title="${study}">${study.length > 10 ? `${study.substr(0,10)}...`:study}</label>
                                <div class="ml-auto">
                                    <div class="filter-btn custom-margin study-total" data-consortia-study='${consortium}@#$${study}'>
                                        ${numberWithCommas(total)}
                                    </div>
                                </div>
                            </li>`;
            }
        }
        innerTemplate += `</ul></ul>`
        template += innerTemplate;
        
    }
    template += `</br>
    </div>`;
    div1.innerHTML = template;
    document.getElementById('allFilters').appendChild(div1);
    addEventSummaryStatsFilterForm(jsonData, headers);
    addEventConsortiumSelect();
}

const aggegrateData = (jsonData) => {
    let obj = {};
    jsonData.forEach(value => {
        if(obj[value.consortium] === undefined) obj[value.consortium] = {};
        if(obj[value.consortium]){
            if(obj[value.consortium]['consortiumTotal'] === undefined) obj[value.consortium]['consortiumTotal'] = 0;
            obj[value.consortium]['consortiumTotal'] += parseInt(value.total);
            if(obj[value.consortium][value.study] === undefined) {
                obj[value.consortium][value.study] = {};
                obj[value.consortium][value.study].total= 0;
            }
            obj[value.consortium][value.study].total += parseInt(value.total);
        }
    });
    return obj;
}

export const addEventConsortiumSelect = () => {
    const elements = document.getElementsByClassName('consortium-selection');
    Array.from(elements).forEach(element => {
        element.addEventListener('click', () => {
            if (element.lastElementChild.classList.contains('fa-caret-up')){
                element.lastElementChild.classList.add('fa-caret-down');
                element.lastElementChild.classList.remove('fa-caret-up');

            } else {
                element.lastElementChild.classList.add('fa-caret-up');
                element.lastElementChild.classList.remove('fa-caret-down');
            }
        });
    });

    const consortiums = document.getElementsByClassName('select-consortium');
    Array.from(consortiums).forEach(el => {
        el.addEventListener('click', () => {
            if(el.checked){
                Array.from(el.parentNode.parentNode.querySelectorAll('.select-study')).forEach(btns => btns.checked = true);
            }
            else {
                Array.from(el.parentNode.parentNode.querySelectorAll('.select-study')).forEach(btns => btns.checked =  false);
            }
        });
    });

    const studies = document.querySelectorAll('.select-study');
    Array.from(studies).forEach(element => {
        element.addEventListener('click', () => {
            const allStudiesInConsortium = element.parentElement.parentElement.querySelectorAll('.select-study').length
            const selectedStudiesInConsortium = element.parentElement.parentElement.querySelectorAll('input:checked.select-study').length
            if(allStudiesInConsortium === selectedStudiesInConsortium) {
                element.parentElement.parentElement.parentElement.querySelector('.select-consortium').checked = true;
            }
            else {
                element.parentElement.parentElement.parentElement.querySelector('.select-consortium').checked = false;
            }
        });
    })
}

export const renderAllCharts = (finalData, headers, showFilter) => {
    generateBarChart('ageInt', 'dataSummaryVizChart3', 'dataSummaryVizLabel3', 'chartDiv3', finalData);
    generateBarSingleSelect('famHist', 'dataSummaryVizChart6', 'dataSummaryVizLabel6', 'chartDiv6', finalData, headers)
    renderEthnicityBarChart(finalData, 'ethnicityClass', 'dataSummaryVizChart5', 'dataSummaryVizLabel5', 'chartDiv5');
    renderPlotlyPieChart(finalData, 'ER_statusIndex', 'dataSummaryVizChart4', 'dataSummaryVizLabel4', 'chartDiv4', headers);
    renderStatusBarChart(finalData, 'status', 'dataSummaryVizChart2', 'dataSummaryVizLabel2', 'chartDiv2');
    renderStudyDesignBarChart(finalData, 'studyDesign', 'dataSummaryVizChart7', 'dataSummaryVizLabel7', 'chartDiv7');
    if(showFilter) {
        allFilters(finalData, headers);
    };
}

export const updateCounts = (data) => {
    const obj = aggegrateData(data);
    for(let consortia in obj){
        const elements = document.querySelectorAll(`[data-consortia="${consortia}"]`);
        Array.from(elements).forEach(element => {
            element.innerHTML = numberWithCommas(obj[consortia].consortiumTotal);
        });
        for(let study in obj[consortia]){
            const studyElements = document.querySelectorAll(`[data-consortia-study="${consortia}@#$${study}"]`);
            Array.from(studyElements).forEach(element => {
                element.innerHTML = numberWithCommas(obj[consortia][study].total);
            });
        };
    };
}

export const getSelectedStudies = () => {
    const elements = document.querySelectorAll(`input:checked.select-study`);
    const array = [];
    Array.from(elements).forEach(element => {
        const consortium = element.dataset.consortium;
        const study = element.dataset.study;
        const value = `${consortium}@#$${study}`
        if(array.indexOf(value) === -1) array.push(value);
    })
    return array;
};

const generateBarChart = (parameter, id, labelID, chartDiv, jsonData) => {
    document.getElementById(chartDiv).classList = ['background-white'];
    const data = [
        {
            x: ['<20','20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '>=90'],
            y: [ mapReduce(jsonData, '10-19'), mapReduce(jsonData, '20-29'), mapReduce(jsonData, '30-39'), mapReduce(jsonData, '40-49'), mapReduce(jsonData, '50-59'), mapReduce(jsonData, '60-69'), mapReduce(jsonData, '70-79'), mapReduce(jsonData, '80-89'), mapReduce(jsonData, '90-99') + mapReduce(jsonData, '100-109') ],
            marker:{
                color: ['#BF1B61', '#BF1B61', '#BF1B61', '#BF1B61', '#BF1B61', '#BF1B61', '#BF1B61', '#BF1B61', '#BF1B61']
            },
          type: 'bar'
        }
    ];
    const layout = {
        xaxis: {fixedrange: true, automargin: true, tickangle: 45, tickfont: {size : plotTextSize}},
        yaxis: {title:`Count`, fixedrange: true, tickformat:',d', tickfont: {size : plotTextSize}},
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };
    Plotly.newPlot(`${id}`, data, layout, {responsive: true, displayModeBar: false});
    document.getElementById(labelID).innerHTML = `${variables.BCAC[parameter]['label']}`;
}

const generateBarSingleSelect = (parameter, id, labelID, chartDiv, jsonData, headers) => {
    let x = headers.filter(dt => /famHist_/.test(dt))
    let y = x.map(dt => mapReduce(jsonData, dt));
    x = x.map(dt => chartLabels[dt.replace(/famHist_/, '')] ? chartLabels[dt.replace(/famHist_/, '')] : dt.replace(/famHist_/, ''));
    
    let tmpObj = {};
    x.forEach((l,i) => tmpObj[l] = y[i])
    for(let obj in tmpObj) {
        if(tmpObj[obj] === 0) delete tmpObj[obj];
    }
    x = Object.keys(tmpObj);
    y = Object.values(tmpObj);
    document.getElementById(chartDiv).classList = ['background-white'];
    const data = [
        {
            x: x,
            y: y,
            marker:{
                color: ['#BF1B61', '#f7b6d2', '#7F7F7F', '#cccccc']
            },
          type: 'bar'
        }
    ];
    const layout = {
        xaxis: {fixedrange: true, automargin: true, tickangle: 45, tickfont: {size : plotTextSize}},
        yaxis: {title:`Count`, fixedrange: true, tickformat:',d', tickfont: {size : plotTextSize}},
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };
    Plotly.newPlot(`${id}`, data, layout, {responsive: true, displayModeBar: false});

    document.getElementById(labelID).innerHTML = `${variables.BCAC[parameter]['label']}`;
}

const renderPlotlyPieChart = (jsonData, parameter, id, labelID, chartDiv, headers) => {
    document.getElementById(chartDiv).classList = ['background-white'];
    let pieLabel = ''
    if(variables.BCAC[parameter] && variables.BCAC[parameter]['label']){
        pieLabel = variables.BCAC[parameter]['label'];
    }else{
        pieLabel = parameter;
    }
    
    document.getElementById(labelID).innerHTML = `${pieLabel}`;
    let values = headers.filter(dt => /ER_statusIndex_/.test(dt)).map(dt => mapReduce(jsonData, dt));
    let labels = headers.filter(dt => /ER_statusIndex_/.test(dt)).map(dt => chartLabels[dt.replace(/ER_statusIndex_/, '')] ? chartLabels[dt.replace(/ER_statusIndex_/, '')] : dt.replace(/ER_statusIndex_/, ''));
    let tmpObj = {};
    labels.forEach((l,i) => tmpObj[l] = values[i])
    for(let obj in tmpObj) {
        if(tmpObj[obj] === 0) delete tmpObj[obj];
    }
    values = Object.values(tmpObj);
    labels = Object.keys(tmpObj);
    const d3 = Plotly.d3
    const format = d3.format(',3f')
    const total = values.reduce((a, b) => a + b)
    const text = values.map((v, i) => `
            ${labels[i]}<br>
            ${format(v)}<br>
            ${v / total * 100}%
        `)
    const data = [
        {
            labels,
            values,
            type: 'pie',
            textinfo: 'label+percent',
            textfont : {
                size: plotTextSize
            },
            hoverinfo: text,
            textposition: 'outside',
            automargin: true,
            showlegend: false,
            marker:{
                colors: ['#BF1B61', '#f7b6d2', '#7F7F7F', '#cccccc']
            },
            hole: .4
        }
    ];
    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };
    Plotly.newPlot(`${id}`, data, layout, {responsive: true, displayModeBar: false});
}

const countStatus = (value, jsonData) => {
    return jsonData.filter(dt => {if(dt.status === value) return dt}).map(dt => dt['total']).reduce((a,b) => a+b);
}


const renderStatusBarChart = (jsonData, parameter, id, labelID, chartDiv) => {
    document.getElementById(chartDiv).classList = ['background-white'];
    let pieLabel = ''
    if(variables.BCAC[parameter] && variables.BCAC[parameter]['label']){
        pieLabel = variables.BCAC[parameter]['label'];
    }else{
        pieLabel = parameter;
    }
    document.getElementById(labelID).innerHTML = `${pieLabel}`;
    const data = [
        {
            x: ['Case', 'Control'],
            y: [countStatus('case', jsonData), countStatus('control', jsonData)],
            type: 'bar',
            marker:{
                color: ['#BF1B61', '#f7b6d2']
            }
        }
    ];
    const layout = {
        xaxis: {fixedrange: true, automargin: true, tickangle: 45, tickfont: {size : plotTextSize}},
        yaxis: {title:`Count`, fixedrange: true, tickformat:',d', tickfont: {size : plotTextSize}},
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };
    Plotly.newPlot(`${id}`, data, layout, {responsive: true, displayModeBar: false});
}

const renderStudyDesignBarChart = (jsonData, parameter, id, labelID, chartDiv) => {
    document.getElementById(chartDiv).classList = ['background-white'];
    let pieLabel = ''
    if(variables.BCAC[parameter] && variables.BCAC[parameter]['label']){
        pieLabel = variables.BCAC[parameter]['label'];
    }else{
        pieLabel = parameter;
    }
    
    document.getElementById(labelID).innerHTML = `${pieLabel}`;
    
    let allLabels = getUniqueConsortium(jsonData, parameter);
    const valueCount = [];
    for(let studyDesign of allLabels){
        valueCount.push(jsonData.filter(dt => {if(dt[parameter] === studyDesign) return dt}).map(dt => dt['total']).reduce((a,b) => a+b));
    }
    const data = [
        {
            x: allLabels,
            y: valueCount,
            type: 'bar',
            marker:{
                color: getColors(allLabels.length)
            },
        }
    ];
    const layout = {
        xaxis: {fixedrange: true, automargin: true, tickangle: 45, tickfont: {size : plotTextSize}},
        yaxis: {title:`Count`, fixedrange: true, tickformat:',d', tickfont: {size : plotTextSize}},
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };
    Plotly.newPlot(`${id}`, data, layout, {responsive: true, displayModeBar: false});
}

const getUniqueConsortium = (jsonData, parameter) => {
    let array = [];
    for(let obj of jsonData){
        if(array.indexOf(obj[parameter]) === -1) array.push(obj[parameter]);
    }
    return array;
}

const renderEthnicityBarChart = (jsonData, parameter, id, labelID, chartDiv) => {
    document.getElementById(chartDiv).classList = ['background-white'];
    let pieLabel = ''
    if(variables.BCAC[parameter] && variables.BCAC[parameter]['label']){
        pieLabel = variables.BCAC[parameter]['label'];
    }else{
        pieLabel = parameter;
    }
    
    document.getElementById(labelID).innerHTML = `${pieLabel}`;
    const allLabels = getUniqueConsortium(jsonData, parameter);
    const valueCount = [];
    for(let studyDesign of allLabels){
        valueCount.push(jsonData.filter(dt => {if(dt[parameter] === studyDesign) return dt}).map(dt => dt['total']).reduce((a,b) => a+b));
    }
    const data = [
        {
            x: allLabels,
            y: valueCount,
            type: 'bar',
            marker:{
                color: ['#BF1B61', '#cb4880', '#d876a0','#e5a3bf', '#BF1B61', '#cb4880', '#7F7F7F']
            },
        }
    ];
    const layout = {
        xaxis: {fixedrange: true, automargin: true, tickangle: 45, tickfont: {size : plotTextSize}},
        yaxis: {title:`Count`, fixedrange: true, tickformat:',d', tickfont: {size : plotTextSize}},
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };
    Plotly.newPlot(`${id}`, data, layout, {responsive: true, displayModeBar: false});
}

const getColors = (n) => {
    let colors = [];
    for(let i=0; i<n ; i++) {
        if(Math.abs(i % 2) == 1) colors.push('#f7b6d2');
        else colors.push('#BF1B61')
    }
    return colors;
}
