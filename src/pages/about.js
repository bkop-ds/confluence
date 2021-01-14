import { addEventConsortiaFilter } from "../event.js";
import { getPublicFile, numberWithCommas, publicDataFileId } from "./../shared.js";

export const aboutConfluence = (activeTab, showDescripton) => {
    let template = `
        <div class="general-bg body-min-height padding-bottom-1rem">
            <div class="container">
                ${showDescripton ? `<div class="main-summary-row white-bg div-border">
                    <button class="sub-menu-btn"><a class="nav-link ${activeTab === 'overview' ? 'active': ''} black-font font-size-14" href="#about/overview"><strong>Overview</strong></a></button>
                    <button class="sub-menu-btn"><a class="nav-link ${activeTab !== 'overview' ? 'active': ''} black-font font-size-14" href="#about/description"> <strong>Description of Studies</strong></a></button>
                </div>`:``}
                <div id="overview"></div>
            </div>
        </div>
    `;
    document.getElementById('confluenceDiv').innerHTML = template;
}

export const renderOverView = () => {
    let template = `
        <div class="main-summary-row">
            <div class="align-left">
                <h1 class="page-header">Learn about Confluence</h1>
            </div>
        </div>
        <div class="home-page-stats font-size-18">
            <div class="main-summary-row">
                <div class="col align-left">
                    </br>
                    <span>
                        Confluence includes breast cancer case-control studies, case series or clinical trials of female or male breast cancer (invasive or in situ) with the following:
                    </span>
                    </br>
                    <ul>
                        <li>Genome-wide genotyping data</li>
                        <li>Risk factor, pathology, treatment, toxicities and survival data</li>
                        <li>Ethics approval and consent for germline genetic</li>
                    </ul>
                    </br>
                    <span>
                        The Confluence project will harmonize existing genome-wide genotyping data from about 150,000 
                        cases and 200,000 controls and double it by generating new genotypes from at least 150,000 
                        additional breast cancer cases and 100,000 controls, for a total of at least 300,000 cases and 
                        300,000 controls of different ancestries.
                    </span>
                    </br></br>
                    <span>
                        Confluence will also harmonize risk factor, pathology, treatment, toxicities and survival data across studies.
                    </span>
                    </br></br>
                    <span>
                        Genotyping and harmonization of data is expected to be completed in 2022.
                    </span>
                </div>
            </div>
            <div class="align-left" id="confluenceDataSummary"></div>
            <div class="main-summary-row align-left">
                <div class="col">
                    For more information:</br>
                    Visit: <a href="https://dceg.cancer.gov/research/cancer-types/breast-cancer/confluence-project" target="__blank">https://dceg.cancer.gov/research/cancer-types/breast-cancer/confluence-project</a></br>
                    Email: <a href="mailto:ConfluenceProject@nih.gov">ConfluenceProject@nih.gov</a>
                </div>
            </div>
        </div>
    `;
    document.getElementById('overview').innerHTML = template;
    getPublicFile('27jmuhandgz9qnc3tz81cx4v3rb87rrc', publicDataFileId).then(response => {
        const data = response.data;
        if(!data) return;
        const element = document.getElementById('confluenceDataSummary');
        let totalConsortia = 0;
        let totalCases = 0;
        let totalControls = 0;
        let totalStudies = 0;
        
        let summary = '';
        summary += `
        </br>
        <div class="align-center">
            <div class="main-summary-row" style="margin: 0px 15px;margin-bottom:10px">
                <div class="col-md-2" style="padding: 0px">
                    <div class="div-border allow-overflow align-left" style="max-height: 164px; height:100%;padding-left: 5px !important; margin-right: 15px;">
                    <span class="font-size-22">Filter</span></br>`
                    
        for(let key in data) {
            if(key === 'dataModifiedAt') continue;
            ++totalConsortia;
            totalCases += data[key].cases;
            totalControls += data[key].controls;
            totalStudies += data[key].studies;
            summary += `<div class="row font-size-16" style="margin:2px 2px;">
            
                <input type="checkbox" data-consortia="${data[key].name}" id="label${data[key].name}" class="checkbox-consortia"/>
                    <label for="label${data[key].name}" class="study-name" title="${data[key].name}">${data[key].name.length > 10 ? `${data[key].name.substr(0,10)}...`:data[key].name}</label></div>`
        }         
        summary += `</div></div>
                    <div class="col-md-10 align-center" style="padding: 0px">
                        <div class="div-border" style="margin-right: 15px" id="renderDataSummaryCounts"></div>
                    </div></div>
                    <div class="col data-last-modified align-left">Data last modified at - ${new Date(data['dataModifiedAt']).toLocaleString()}</div></div>
                    `
        element.innerHTML = summary;
        renderDataSummary(totalConsortia, totalStudies, totalCases, totalControls);
        addEventConsortiaFilter(data);
    });
}

export const renderDataSummary = (totalConsortia, totalStudies, totalCases, totalControls) => {
    document.getElementById('renderDataSummaryCounts').innerHTML = `
        <div class="row">
            <div class="col">
                <span class="font-size-22">Consortia</span></br>
                <span class="font-size-32">${numberWithCommas(totalConsortia)}</span>
            </div>
            <div class="col">
                <span class="font-size-22">Study</span></br>
                <span class="font-size-32">${numberWithCommas(totalStudies)}</span>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <span class="font-size-22">Cases</span></br>
                <span class="font-size-32">${numberWithCommas(totalCases)}</span>
            </div>
            <div class="col">
                <span class="font-size-22">Controls</span></br>
                <span class="font-size-32">${numberWithCommas(totalControls)}</span>
            </div>
        </div>
    `
}
