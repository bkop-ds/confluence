console.log('confluence.js loaded')

confluence=function(){
    console.log(`ini at ${Date()}`)
    document.getElementById('loginBoxObs').onclick=confluence.loginObs
    document.getElementById('loginBoxAppDev').onclick=confluence.loginAppDev
    document.getElementById('loginBoxAppProd').onclick=confluence.loginAppProd
    confluence.div=document.getElementById('confluenceDiv')
    if(confluence.div){
        if(location.origin.match('localhost')){loginBoxAppDev.parentElement.hidden=false}
        if(location.origin.match('episphere')){loginBoxAppProd.parentElement.hidden=false}
        confluence.UI()
    }
    // index.html events
    if(typeof(hideIndividualReports)){
        hideIndividualReports.onclick=function(){
            if(this.textContent=="[-]"){
                this.textContent="[+]"
                this.style.color="green"
                confluence.div.hidden=true
            }else{
                this.textContent="[-]"
                this.style.color="orange"
                confluence.div.hidden=false
            }
            //debugger
        }
    }
    
}

confluence.iniObs={
    client_id:'rq2ab1uuvrzp86oa0yehgjibqf7arxy5',
    server_id:'NItekKKQEqQBgRsU0qnEBVY3zP0nvieh',
    stateIni:Math.random().toString().slice(2)
}

confluence.iniAppDev={
    client_id:'52zad6jrv5v52mn1hfy1vsjtr9jn5o1w',
    server_id:'2rHTqzJumz8s9bAjmKMV83WHX1ooN4kT',
    stateIni:Math.random().toString().slice(2)
}

confluence.iniAppProd={
    client_id:'1n44fu5yu1l547f2n2fgcw7vhps7kvuw',
    server_id:'2ZYzmHXGyzBcjZ9d1Ttsc1d258LiGGVd',
    stateIni:Math.random().toString().slice(2)
}

confluence.loginObs=function(){
    document.location.href=`https://account.box.com/api/oauth2/authorize?response_type=code&client_id=${confluence.iniObs.client_id}&redirect_uri=https://observablehq.com/@episphere/confluence&state=${confluence.iniObs.stateIni}`
    //debugger
}

confluence.loginAppDev=function(){
    document.location.href=`https://account.box.com/api/oauth2/authorize?response_type=code&client_id=${confluence.iniAppDev.client_id}&redirect_uri=http://localhost:8000/confluence&state=${confluence.iniAppDev.stateIni}`
    //debugger
}

confluence.loginAppProd=function(){
    document.location.href=`https://account.box.com/api/oauth2/authorize?response_type=code&client_id=${confluence.iniAppProd.client_id}&redirect_uri=https://episphere.github.io/confluence&state=${confluence.iniAppProd.stateIni}`
    //debugger
}


confluence.UI=async function(){
    let parms=confluence.searchParms()
    if(parms.code){
        //exchange code for authorization token
        let clt={}
        if(location.origin.match('localhost')){
            clt = confluence.iniAppDev
        }else if(location.origin.match('episphere')){
            clt = confluence.iniAppProd
        }else if(location.origin.match('observablehq')){
            clt = confluence.iniObs
        }
        confluence.client=clt
        var data = `grant_type=authorization_code&code=${parms.code}&client_id=${clt.client_id}&client_secret=${clt.server_id}`;
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
          if (this.readyState === 4) {
            console.log(this.responseText);
            localStorage.parms=this.responseText
            location.search='' // clear url, reload the page
          }
        });
        xhr.open("POST", "https://api.box.com/oauth2/token");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.setRequestHeader("credentials", "same-origin");
        xhr.send(data);
    }else{
        if(localStorage.parms){
            confluence.parms=JSON.parse(localStorage.parms)
            if(confluence.parms.access_token){
                await confluence.UIdo() // <---- ready to go with an authenticated token
            }else{
                alert('access token not found, please contact system administrator')
            }

        }else{
            // there is nothing to do yet
            console.log('not logged in yet')
        }
        
        //debugger

    }

}

confluence.UIdo=async function(){
    confluence.div.innerHTML=' loadind ...'
    await confluence.getFolderInfo(68819242325).then(x=>{ // BCAC root is 68819242325
        confluence.div.innerHTML=''
        // show what is hidden
        summaryHead.hidden=false
        summaryDiv.hidden=false
        individualReportsHeader.hidden=false
        // find subfolders:
        confluence.dir={};
        ['USRT','PLCO','PBCS','AHS'].forEach(async function(fld,i){
            let y = x.item_collection.entries.filter(function(xi){
                return (xi.name==fld)
            })[0]
            confluence.dir[fld]={id:y.id}
            let div = document.createElement('div')
            div.innerHTML=` loading ${fld} ...`
            confluence.div.appendChild(div)
            confluence.dir[fld].div=div
            //if(Object.keys(confluence.dir).length==4){
            //    setTimeout(confluence.summary,1000)
            //}
            // find data folders
            await confluence.getFolderInfo(confluence.dir[fld].id).then(x=>{
                confluence.dir[fld].dir={}
                div.innerHTML=`<h3>${i+1}. ${fld} <span>[-]</span></h3>`;
                ['Survival and Treatment Data',
                 'Risk Factor Data',
                 'Pathology Data',
                 'Core Data'].forEach(async function(dtFld,j){
                     let y = x.item_collection.entries.filter(xi=>(xi.name==dtFld))[0]
                     let divDt = document.createElement('div')
                     divDt.innerHTML=` loading ${dtFld} ...`
                     div.appendChild(divDt)
                     confluence.dir[fld].dir[dtFld]={
                         id:y.id,
                         div:divDt
                     }
                     //console.log(confluence.dir)
                     await confluence.getFolderInfo(confluence.dir[fld].dir[dtFld].id).then(x=>{
                         divDt.innerHTML=`<h4>${i+1}.${j+1}. ${dtFld} <span>[-]</span></h4>`
                         let divDtFiles = document.createElement('div')
                         divDt.appendChild(divDtFiles)
                         let txtFiles=x.item_collection.entries.filter(xi=>(x.item_collection.entries[0].name.match('.txt')))
                         confluence.dir[fld].dir[dtFld].files={}
                         txtFiles.forEach(fl=>{
                             let li = document.createElement('li')
                             divDtFiles.appendChild(li)
                             li.innerHTML=`${fl.name} `
                             let btDisplay = document.createElement('button')
                             btDisplay.textContent="display"
                             btDisplay.className="btDisplay"
                             li.appendChild(btDisplay)
                             let btDelete = document.createElement('button')
                             btDelete.hidden=true
                             btDelete.textContent="delete plot"
                             li.appendChild(btDelete)
                             let divFile = document.createElement('div')
                             li.appendChild(divFile)
                             fl.div=divFile
                             fl.study=dtFld
                             fl.group=fld
                             confluence.dir[fld].dir[dtFld].files[fl.name]=fl
                             btDisplay.onclick=function(){
                                 confluence.displayFile(fl)
                                 btDelete.hidden=false
                                 btDisplay.hidden=true
                             }
                             btDelete.onclick=function(){
                                 divFile.innerHTML=''
                                 btDelete.hidden=true
                                 btDisplay.hidden=false
                             }
                             if(document.querySelectorAll('.btDisplay').length==16){
                                 confluence.summary()
                             }
                         })
                         
                     })

                 })

            })

        })
        //debugger
    })

    //debugger
}

confluence.summary=async function(){ // summary plots 
    // load status for each study
    let dt={}
    let h = '<div id="confluenceStatistics">Partners: <span id="partnerCount" class="statistics">...</span>; Cases: <span id="caseCount" class="statistics">0</span></div>' 
    h += '<table><tr>'
    h += '<td id="summaryStatus" style="vertical-align:top">'
    h += '<h4>Status:</h4>'
    h += '<div id="status"></div>'
    h += '<h4>Study:</h4>'
    h += '<div id="study"></div>'
    h += '</td>'
    h += '<td id="summaryReports" style="vertical-align:top"><p>loading status ...</p></td>'
    h += '</hr><table>'
    summaryDiv.innerHTML=h 
    Object.keys(confluence.dir).sort().forEach(async k=>{
        let txt = await confluence.getFile(confluence.dir[k].dir["Core Data"].files[Object.keys(confluence.dir[k].dir["Core Data"].files)[0]].id)
        dt[k] = confluence.txt2dt(txt)
        summaryReports.innerHTML=`<p>loading ${k} Core Data ...</p>`
        caseCount.textContent=parseInt(caseCount.textContent)+dt[k].tab.study.length
        // add study to left side menu
        let divK = document.createElement('div')
        divK.id=`div${k}`
        divK.innerHTML=`<input type="radio" checked=true> ${k}`
        document.getElementById('study').appendChild(divK)
        let kk = Object.keys(dt)
        partnerCount.textContent=kk.length

        if(kk.length==4){
            // studies listed
            [0,1,2].forEach(s=>{
                let divS = document.createElement('div')
                divS.id=`status${s}`
                divS.innerHTML=`<input type="radio" checked=true> ${s}`
                document.getElementById('status').appendChild(divS)
            })
            summaryReports.innerHTML='<span style="color:red">... ploting under development ...</span>'
            
        }
    })

}

confluence.unique=function(arr){
    let u={}
    arr.forEach(v=>{
        if(v=='888'||v=='777'){v=undefined} // 888 undefined code
        if(!u[v]){u[v]=0}
        u[v]++
    })
    return u
}

confluence.txt2dt=function(txt){
    let dt=txt.split(/\n/g).map(tx=>tx.split(/\t/g))
    // trailing blank
    if((txt.split(/\n+/).slice(-1).length==1)&&(txt.slice(-1)[0].length)){
        dt.pop()
    }
    let tab={}
    hh=dt[0].forEach((h,j)=>{ // headers
        tab[h]=[]
        dt.slice(1).forEach((vv,i)=>{
            tab[h][i]=vv[j]
        })
    })
    let unique=function(arr){
        let u={}
        arr.forEach(v=>{
            if(v=='888'||v=='777'){v=undefined} // 888 undefined code
            if(!u[v]){u[v]=0}
            u[v]++
        })
        return u
    }
    let uni={}
    Object.keys(tab).forEach(k=>{
        uni[k]=unique(tab[k])
    })
    return {
        tab:tab,
        uni:uni
    }
}

confluence.displayFile=async function(fl){
    fl.div.innerHTML='<span style="color:orange;font-size:small">processing ...</span>'
    let txt = await confluence.getFile(fl.id)
    let dt=txt.split(/\n/g).map(tx=>tx.split(/\t/g))
    // trailing blank
    if((txt.split(/\n+/).slice(-1).length==1)&&(txt.slice(-1)[0].length)){
        dt.pop()
    }
    let tab={}
    hh=dt[0].forEach((h,j)=>{ // headers
        tab[h]=[]
        dt.slice(1).forEach((vv,i)=>{
            tab[h][i]=vv[j]
        })
    })
    let unique=function(arr){
        let u={}
        arr.forEach(v=>{
            if(v=='888'||v=='777'){v=undefined} // 888 undefined code
            if(!u[v]){u[v]=0}
            u[v]++
        })
        return u
    }
    fl.tab=tab
    fl.uni={}
    Object.keys(tab).forEach(k=>{
        fl.uni[k]=unique(tab[k])
    })
    fl.info = await confluence.getFileInfo(fl.id)
    fl.div.innerHTML='<span style="color:green;font-size:small">processing ... done</span>'
    confluence.plotFile(fl)
}

confluence.plotFile=function(fl){
    let h=`<p style="font-size:x-small;color:gray">Using data from file #${fl.id}, version #${fl.file_version.id}, originally created by ${fl.info.created_by.name} at ${fl.info.created_at}, last modified by ${fl.info.modified_by.name} at ${fl.info.modified_at} (${fl.info.sequence_id} modifications).<p>`
    h +='<p><select id="distParm"></select></p>'
    h +='<div id="plotlyDiv"></div>'
    fl.div.innerHTML=h
    let sel1 = fl.div.querySelector('#distParm')
    Object.keys(fl.uni).sort().forEach(k=>{
        let op = document.createElement('option')
        op.value=op.textContent=k
        sel1.appendChild(op)  
    })
    sel1.onchange=function(){
        confluence.plotlyFile(fl,sel1.value,fl.div.querySelector('#plotlyDiv'))
    }
    confluence.plotlyFile(fl,sel1.value,fl.div.querySelector('#plotlyDiv'))
}

confluence.plotlyFile=function(fl,parm,div){
    var trace = {
        type:'bar',
        x:Object.keys(fl.uni[parm]),
        y:Object.keys(fl.uni[parm]).map(k=>fl.uni[parm][k])
    }
    var unCount=` (${trace.y.reduce((a,b)=>a+b)} total)`
    if(trace.x.indexOf('undefined')>-1){
        unCount = `(${trace.y[trace.x.indexOf('undefined')]}/${trace.y.reduce((a,b)=>a+b)} undefined)`
    }
    var layout = {
        title: `${fl.group}/${fl.study}`,
        xaxis: {title:`${parm}`},
        yaxis: {title:`count ${unCount}`}
    };
    Plotly.newPlot(div, [trace], layout, {responsive: true});
}

confluence.searchParms=function(){
    //localStorage.parms='{}' // clear cached parms
    let parms={}
    if(location.search.length>3){
        location.search.slice(1).split('&').forEach(function(pp){
            pp=pp.split('=')
            parms[pp[0]]=pp[1]
        })
    }
    return parms
}

/*confluence.getFileInfo=function(id,fun){
    fun=fun||console.log
    fetch('https://api.box.com/2.0/files/'+id,{
        method:'GET',
        headers:{
            Authorization:"Bearer "+confluence.parms.access_token
        }
    }).then(x=>x.json().then(fun))
}
*/


confluence.getFileInfo=async function(id){
    return (await fetch('https://api.box.com/2.0/files/'+id,{
        method:'GET',
        headers:{
            Authorization:"Bearer "+confluence.parms.access_token
        }
    })).json()
}
confluence.getFile=async function(id){
    return (await fetch(`https://api.box.com/2.0/files/${id}/content`,{
        method:'GET',
        headers:{
            Authorization:"Bearer "+confluence.parms.access_token
        }
    })).text()
}

confluence.getFolderInfo=async function(id){
    var r = (await fetch('https://api.box.com/2.0/folders/'+id,{
        method:'GET',
        headers:{
            Authorization:"Bearer "+confluence.parms.access_token
        }
    }))
    if(r.statusText=="Unauthorized"){
        delete localStorage.parms
        alert('session expired, reloading')
        location.search=''
    }else{
        return r.json()
    }
}

// https://account.box.com/api/oauth2/authorize?response_type=code&client_id=${confluence.ini.client_id}&redirect_uri=${location.origin}${location.pathname}&state=${cohort.parms.stateIni}`


window.onload=confluence
