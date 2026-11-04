(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const PALETTE = ["#8055d8","#ff7197","#35cbb1","#ffc94f","#5d9ce8","#b18ae8","#ff9d6e","#54b8d1","#d66eb7"];
  const PAGE_SIZE = 10;
  const sampleRows = [
    ["Jan","Nova Phone","Electronics",42000,8400,12,"South"],["Jan","Luma Headphones","Electronics",18500,3700,25,"West"],["Jan","Terra Bottle","Lifestyle",9600,2880,40,"North"],
    ["Feb","Nova Phone","Electronics",46500,9300,13,"South"],["Feb","Luma Headphones","Electronics",21000,4200,28,"East"],["Feb","Terra Bottle","Lifestyle",11200,3360,46,"North"],
    ["Mar","Nova Phone","Electronics",51000,10200,15,"West"],["Mar","Terra Bottle","Lifestyle",12400,3720,52,"South"],["Mar","Orbit Backpack","Lifestyle",16800,5040,21,"East"],
    ["Apr","Luma Headphones","Electronics",24800,4960,32,"North"],["Apr","Orbit Backpack","Lifestyle",19200,5760,24,"West"],["Apr","Nova Phone","Electronics",54800,10960,16,"East"],
    ["May","Nova Phone","Electronics",59200,11840,17,"South"],["May","Terra Bottle","Lifestyle",14800,4440,61,"West"],["May","Orbit Backpack","Lifestyle",21600,6480,27,"North"],
    ["Jun","Luma Headphones","Electronics",27600,5520,36,"East"],["Jun","Nova Phone","Electronics",62500,12500,18,"North"],["Jun","Terra Bottle","Lifestyle",16200,4860,68,"South"],
    ["Jul","Orbit Backpack","Lifestyle",23800,7140,30,"West"],["Jul","Luma Headphones","Electronics",29400,5880,39,"South"],["Jul","Nova Phone","Electronics",67400,13480,20,"East"],
    ["Aug","Terra Bottle","Lifestyle",17900,5370,74,"North"],["Aug","Orbit Backpack","Lifestyle",25400,7620,33,"East"],["Aug","Nova Phone","Electronics",70800,14160,21,"West"],
    ["Sep","Luma Headphones","Electronics",31800,6360,42,"North"],["Sep","Terra Bottle","Lifestyle",19300,5790,80,"East"],["Sep","Orbit Backpack","Lifestyle",28100,8430,36,"South"],
    ["Oct","Nova Phone","Electronics",76500,15300,23,"North"],["Oct","Luma Headphones","Electronics",34600,6920,45,"West"],["Oct","Orbit Backpack","Lifestyle",30200,9060,39,"East"]
  ];
  const headers = ["Month","Product","Category","Sales","Profit","Quantity","Region"];
  let allRows = sampleRows.map(r => Object.fromEntries(headers.map((h,i)=>[h,r[i]])));
  let visibleRows = [...allRows], datasetName = "Sample sales dataset", currentType = "bar";
  let previewChart = null, gallery = [], page = 1, sortState = {key:null,dir:1}, toastTimer;
  const numeric = (v) => v !== "" && v !== null && v !== undefined && Number.isFinite(Number(v));
  const number = (v) => Number(v).toLocaleString("en-IN",{maximumFractionDigits:2});
  const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2800);}
  function columns(){return allRows.length?Object.keys(allRows[0]):[];}
  function isNumericColumn(key){const vals=allRows.map(r=>r[key]).filter(v=>v!==""&&v!=null);return vals.length>0&&vals.filter(numeric).length/vals.length>=.7;}
  function aggregate(xKey,yKey){
    const map=new Map();
    visibleRows.forEach(row=>{const label=String(row[xKey]??"(blank)");const val=Number(row[yKey]);if(!numeric(row[yKey]))return;map.set(label,(map.get(label)||0)+val);});
    return [...map.entries()].map(([label,value])=>({label,value}));
  }
  function chartData(type,xKey,yKey){
    let items=aggregate(xKey,yKey);
    if(type==="pie"||type==="doughnut"||type==="polarArea"||type==="radar") items=items.slice(0,18);
    return {labels:items.map(d=>d.label),values:items.map(d=>d.value)};
  }
  function makeConfig(type,title,xKey,yKey,mini=false){
    const d=chartData(type,xKey,yKey), multi=["pie","doughnut","polarArea"].includes(type);
    const colors=d.labels.map((_,i)=>PALETTE[i%PALETTE.length]);
    return {type,data:{labels:d.labels,datasets:[{label:yKey,data:d.values,backgroundColor:multi?colors:(type==="line"?"rgba(128,85,216,.16)":colors[0]),borderColor:multi?colors:(type==="line"?colors[0]:colors[0]),borderWidth:type==="line"?3:1,borderRadius:type==="bar"?6:0,fill:type==="line",tension:.35,pointRadius:type==="line"?3:0,hoverOffset:8}]},options:{responsive:true,maintainAspectRatio:false,animation:{duration:450},plugins:{legend:{display:multi,position:"bottom",labels:{usePointStyle:true,pointStyle:"circle",boxWidth:7,padding:12,font:{family:"DM Sans",size:9}}},title:{display:!mini,text:title,color:"#4a3b60",font:{family:"Manrope",size:mini?11:13,weight:"700"},padding:{bottom:14}},tooltip:{backgroundColor:"#32136e",padding:10,titleFont:{family:"DM Sans"},bodyFont:{family:"DM Sans"},callbacks:{label:(ctx)=>` ${yKey}: ${number(ctx.parsed?.y ?? ctx.parsed ?? ctx.raw)}`}}},scales:multi?{}:{x:{grid:{display:false},ticks:{color:"#9c92a7",font:{size:9},maxRotation:35},title:{display:true,text:xKey,color:"#92889e",font:{size:9}}},y:{beginAtZero:true,grid:{color:"#f1edf5"},ticks:{color:"#9c92a7",font:{size:9},callback:v=>number(v)},title:{display:true,text:yKey,color:"#92889e",font:{size:9}}}}}};
  }
  function populateSelects(){
    const cols=columns(), x=$("xColumn"), y=$("yColumn"), oldX=x.value,oldY=y.value;
    x.innerHTML=cols.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    const nums=cols.filter(isNumericColumn);
    y.innerHTML=cols.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}${isNumericColumn(c)?" · numeric":""}</option>`).join("");
    x.value=cols.includes(oldX)?oldX:(cols.includes("Month")?"Month":cols[0]||"");
    y.value=nums.includes(oldY)?oldY:(nums.includes("Sales")?"Sales":nums[0]||cols[0]||"");
    const f=$("filterColumn"),oldF=f.value;
    f.innerHTML='<option value="">All columns</option>'+cols.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    f.value=cols.includes(oldF)?oldF:"";
    updateFilterValues();
  }
  function updateFilterValues(){
    const col=$("filterColumn").value, sel=$("filterValue"), previous=sel.value;
    const vals=col?[...new Set(allRows.map(r=>String(r[col]??"")))]:[];
    sel.innerHTML='<option value="">All values</option>'+vals.sort((a,b)=>a.localeCompare(b)).map(v=>`<option value="${escapeHtml(v)}">${escapeHtml(v||"(blank)")}</option>`).join("");
    sel.value=vals.includes(previous)?previous:"";
  }
  function applyFilters(){
    const q=$("tableSearch").value.trim().toLowerCase(), col=$("filterColumn").value, val=$("filterValue").value;
    visibleRows=allRows.filter(r=>(!q||columns().some(c=>String(r[c]??"").toLowerCase().includes(q)))&&(!col||!val||String(r[col]??"")===val));
    if(sortState.key) visibleRows.sort((a,b)=>compare(a[sortState.key],b[sortState.key])*sortState.dir);
    page=1;renderTable();renderStats();renderInsights();refreshCharts();
  }
  function compare(a,b){if(numeric(a)&&numeric(b))return Number(a)-Number(b);return String(a??"").localeCompare(String(b??""));}
  function renderTable(){
    const cols=columns(),start=(page-1)*PAGE_SIZE,rows=visibleRows.slice(start,start+PAGE_SIZE),pages=Math.max(1,Math.ceil(visibleRows.length/PAGE_SIZE));
    $("dataTable").querySelector("thead").innerHTML="<tr>"+cols.map(c=>`<th data-key="${escapeHtml(c)}">${escapeHtml(c)} <span>${sortState.key===c?(sortState.dir===1?"↑":"↓"):"↕"}</span></th>`).join("")+"</tr>";
    $("dataTable").querySelector("tbody").innerHTML=rows.length?rows.map(r=>"<tr>"+cols.map(c=>`<td>${escapeHtml(r[c]??"—")}</td>`).join("")+"</tr>").join(""):`<tr><td colspan="${cols.length}" style="text-align:center;padding:28px">No matching records. Try clearing your search or filter.</td></tr>`;
    $("rowsCount").textContent=`Showing ${visibleRows.length} of ${allRows.length}`;
    $("pageInfo").textContent=`${page} / ${pages}`;$("prevPage").disabled=page<=1;$("nextPage").disabled=page>=pages;
    $("tableStatus").textContent=datasetName;
    $("dataTable").querySelectorAll("th").forEach(th=>th.addEventListener("click",()=>{const key=th.dataset.key;sortState={key,dir:sortState.key===key?-sortState.dir:1};applyFilters();}));
  }
  function renderStats(){
    const sales=visibleRows.map(r=>Number(r.Sales)).filter(Number.isFinite);
    $("totalRecords").textContent=number(visibleRows.length);$("totalColumns").textContent=columns().length;
    const avg=sales.length?sales.reduce((a,b)=>a+b,0)/sales.length:0,max=sales.length?Math.max(...sales):0,min=sales.length?Math.min(...sales):0;
    $("averageValue").textContent=sales.length?"₹ "+number(avg):"—";$("maximumValue").textContent=sales.length?"₹ "+number(max):"—";$("minimumValue").textContent=sales.length?"₹ "+number(min):"—";
  }
  function renderInsights(){
    const el=$("insightsList"), nums=columns().filter(isNumericColumn), cats=columns().filter(c=>!isNumericColumn(c));
    const insights=[];
    if(!visibleRows.length){el.innerHTML='<div class="gallery-empty">No visible records to analyse.</div>';return;}
    const metric=nums.includes("Sales")?"Sales":nums[0], category=cats.includes("Product")?"Product":cats[0];
    if(metric&&category){
      const totals=new Map();visibleRows.forEach(r=>{const k=String(r[category]??"(blank)");if(numeric(r[metric]))totals.set(k,(totals.get(k)||0)+Number(r[metric]));});
      const ranked=[...totals].sort((a,b)=>b[1]-a[1]);
      if(ranked.length){insights.push({icon:"↗",title:"Top performer",text:`${ranked[0][0]} leads ${category.toLowerCase()} with ${metric.toLowerCase()} of ${number(ranked[0][1])}.`});if(ranked.length>1)insights.push({icon:"⌄",title:"Lowest contributor",text:`${ranked[ranked.length-1][0]} has the lowest total at ${number(ranked[ranked.length-1][1])}.`});}
    }
    if(nums.length){const key=nums.includes("Profit")?"Profit":metric, vals=visibleRows.map(r=>Number(r[key])).filter(Number.isFinite);if(vals.length){const avg=vals.reduce((a,b)=>a+b,0)/vals.length;insights.push({icon:"∿",title:"The big picture",text:`Average ${key.toLowerCase()} is ${number(avg)} across ${vals.length} valid values (range ${number(Math.min(...vals))}–${number(Math.max(...vals))}).`});}}
    if(columns().includes("Month")&&metric){const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];const by=aggregate("Month",metric).sort((a,b)=>months.indexOf(a.label)-months.indexOf(b.label));if(by.length>1){const delta=by[by.length-1].value-by[0].value;insights.push({icon:delta>=0?"↗":"↘",title:"Month-to-month snapshot",text:`From ${by[0].label} to ${by[by.length-1].label}, total ${metric.toLowerCase()} ${delta>=0?"increased":"decreased"} by ${number(Math.abs(delta))}.`});}}
    el.innerHTML=insights.slice(0,4).map(i=>`<div class="insight-item"><span class="insight-symbol">${i.icon}</span><div><b>${escapeHtml(i.title)}</b><p>${escapeHtml(i.text)}</p></div></div>`).join("");
  }
  function refreshCharts(){
    if(previewChart){const x=$("xColumn").value,y=$("yColumn").value;previewChart.data=makeConfig(currentType,$("chartTitle").value||"Chart",x,y).data;previewChart.options=makeConfig(currentType,$("chartTitle").value||"Chart",x,y).options;previewChart.update();}
    gallery.forEach((item,i)=>{const chart=Chart.getChart($(`galleryChart${i}`));if(chart){const cfg=makeConfig(item.type,item.title,item.x,item.y,true);chart.data=cfg.data;chart.update();}});
    $("previewCount").textContent=`${aggregate($("xColumn").value,$("yColumn").value).length} categories`;
  }
  function createPreview(){
    if(previewChart)previewChart.destroy();
    const x=$("xColumn").value,y=$("yColumn").value;
    if(!x||!y||!isNumericColumn(y)){$("previewEmpty").hidden=false;return;}
    $("previewEmpty").hidden=true;
    previewChart=new Chart($("previewChart"),makeConfig(currentType,$("chartTitle").value||"Chart",x,y));
    $("previewCaption").textContent=`${y} by ${x}`;
    $("previewCount").textContent=`${aggregate(x,y).length} categories`;
  }
  function addGalleryChart(){
    const x=$("xColumn").value,y=$("yColumn").value,title=$("chartTitle").value.trim()||`${y} by ${x}`;
    if(!x||!y||!isNumericColumn(y)){toast("Choose a numeric Y-axis column to create a chart.");return;}
    const id=Date.now()+Math.random(),item={id,title,x,y,type:currentType};
    gallery.unshift(item);renderGallery();toast("Chart added to your gallery!");
  }
  function renderGallery(){
    $("galleryCount").textContent=gallery.length;
    if(!gallery.length){$("galleryGrid").innerHTML='<div class="gallery-empty">Your gallery is ready for its first chart. Create one in the builder above.</div>';return;}
    $("galleryGrid").innerHTML=gallery.map((g,i)=>`<article class="chart-card"><div class="chart-card-head"><div><h3>${escapeHtml(g.title)}</h3><small>${escapeHtml(g.type)} · ${escapeHtml(g.y)} by ${escapeHtml(g.x)}</small></div><div class="chart-actions"><button class="icon-button download-chart" data-id="${g.id}" title="Download PNG" aria-label="Download chart as PNG">↓</button><button class="icon-button delete remove-chart" data-id="${g.id}" title="Remove chart" aria-label="Remove chart">×</button></div></div><div class="chart-card-canvas"><canvas id="galleryChart${i}" aria-label="${escapeHtml(g.title)}"></canvas></div></article>`).join("");
    gallery.forEach((g,i)=>new Chart($(`galleryChart${i}`),makeConfig(g.type,g.title,g.x,g.y,true)));
    $("galleryGrid").querySelectorAll(".remove-chart").forEach(b=>b.addEventListener("click",()=>{const item=gallery.find(g=>String(g.id)===b.dataset.id);if(item){const idx=gallery.indexOf(item);const chart=Chart.getChart($(`galleryChart${idx}`));if(chart)chart.destroy();gallery=gallery.filter(g=>g!==item);renderGallery();}}));
    $("galleryGrid").querySelectorAll(".download-chart").forEach(b=>b.addEventListener("click",()=>{const item=gallery.find(g=>String(g.id)===b.dataset.id);const idx=gallery.indexOf(item),chart=Chart.getChart($(`galleryChart${idx}`));if(chart)downloadDataUrl(chart.toBase64Image(),`${safeName(item.title)}.png`);}));
  }
  function safeName(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"dataviz-chart";}
  function downloadDataUrl(url,name){const a=document.createElement("a");a.href=url;a.download=name;a.click();}
  function downloadBlob(content,name,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function csvCell(v){const s=String(v??"");return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
  function exportCsv(){const cols=columns(),csv=[cols.map(csvCell).join(","),...visibleRows.map(r=>cols.map(c=>csvCell(r[c])).join(","))].join("\r\n");downloadBlob("\uFEFF"+csv,`${safeName(datasetName)}-filtered.csv`,"text/csv;charset=utf-8");toast("Filtered CSV downloaded.");}
  function exportSummary(){
    const lines=["DATAVIZ STUDIO — CHART SUMMARY",`Dataset: ${datasetName}`,`Visible records: ${visibleRows.length}`,`Columns: ${columns().join(", ")}`,"", "INSIGHTS",...Array.from($("insightsList").querySelectorAll(".insight-item")).map(el=>`${el.querySelector("b").textContent}: ${el.querySelector("p").textContent}`),"","GALLERY CHARTS",...(gallery.length?gallery.map((g,i)=>`${i+1}. ${g.title} (${g.type}) — ${g.y} by ${g.x}`):["No charts created yet."]),"","Generated locally by DataViz Studio."];
    downloadBlob(lines.join("\n"),"dataviz-chart-summary.txt","text/plain;charset=utf-8");toast("Chart summary downloaded.");
  }
  // RFC-4180-friendly CSV parser, including quoted commas, escaped quotes and newlines.
  function parseCSV(text){
    const rows=[];let row=[],field="",quoted=false;
    for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c;}else if(c==='"'&&field==="")quoted=true;else if(c===","){row.push(field);field="";}else if(c==="\n"||c==="\r"){if(c==="\r"&&text[i+1]==="\n")i++;row.push(field);if(row.some(v=>v.trim()!==""))rows.push(row);row=[];field="";}else field+=c;}
    if(quoted)throw new Error("The CSV contains an unclosed quoted field.");if(field.length||row.length){row.push(field);if(row.some(v=>v.trim()!==""))rows.push(row);}if(rows.length<2)throw new Error("Add a header row and at least one data record.");
    const heads=rows.shift().map((h,i)=>h.trim()||`Column ${i+1}`);if(new Set(heads).size!==heads.length)throw new Error("Column headers must be unique.");
    return rows.map(values=>Object.fromEntries(heads.map((h,i)=>{let v=(values[i]??"").trim();if(v!==""&&numeric(v))v=Number(v);return [h,v];})));
  }
  async function handleFile(file){
    if(!file)return;if(!/\.csv$/i.test(file.name)&&file.type!=="text/csv"){toast("Please choose a .csv file.");return;}
    if(file.size>5*1024*1024){toast("CSV is too large. Maximum file size is 5 MB.");return;}
    try{const text=await file.text();const parsed=parseCSV(text);if(!parsed.length)throw new Error("No data records found.");allRows=parsed;datasetName=file.name;gallery.forEach((_,i)=>{const c=Chart.getChart($(`galleryChart${i}`));if(c)c.destroy();});gallery=[];sortState={key:null,dir:1};$("datasetName").textContent=file.name;populateSelects();applyFilters();createPreview();renderGallery();toast(`Loaded ${parsed.length} records from ${file.name}.`);}
    catch(err){toast(`Could not load CSV: ${err.message}`);}finally{$("fileInput").value="";}
  }
  function resetSample(){allRows=sampleRows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]])));datasetName="Sample sales dataset";$("datasetName").textContent=datasetName;$("tableSearch").value="";sortState={key:null,dir:1};gallery.forEach((_,i)=>{const c=Chart.getChart($(`galleryChart${i}`));if(c)c.destroy();});gallery=[];populateSelects();$("filterColumn").value="";updateFilterValues();applyFilters();createPreview();renderGallery();toast("Sample dataset restored.");}
  function init(){
    populateSelects();renderStats();renderTable();renderInsights();createPreview();renderGallery();
    $("chartForm").addEventListener("submit",e=>{e.preventDefault();createPreview();addGalleryChart();});
    $("chartTypes").querySelectorAll(".type-option").forEach(btn=>btn.addEventListener("click",()=>{currentType=btn.dataset.type;$("chartTypes").querySelectorAll(".type-option").forEach(b=>b.classList.toggle("selected",b===btn));createPreview();}));
    ["xColumn","yColumn"].forEach(id=>$(id).addEventListener("change",createPreview));
    $("chartTitle").addEventListener("input",()=>{if(previewChart){previewChart.options.plugins.title.text=$("chartTitle").value||"Chart";previewChart.update();}});
    $("tableSearch").addEventListener("input",applyFilters);
    $("filterColumn").addEventListener("change",()=>{updateFilterValues();applyFilters();});
    $("filterValue").addEventListener("change",applyFilters);
    $("clearFilter").addEventListener("click",()=>{$("filterColumn").value="";updateFilterValues();$("tableSearch").value="";applyFilters();});
    $("prevPage").addEventListener("click",()=>{page=Math.max(1,page-1);renderTable();});
    $("nextPage").addEventListener("click",()=>{page=Math.min(Math.ceil(visibleRows.length/PAGE_SIZE),page+1);renderTable();});
    $("uploadButton").addEventListener("click",()=>$("fileInput").click());$("topUpload").addEventListener("click",()=>$("fileInput").click());$("heroUpload").addEventListener("click",()=>$("fileInput").click());
    $("fileInput").addEventListener("change",e=>handleFile(e.target.files[0]));
    $("sampleReset").addEventListener("click",resetSample);$("exportCsv").addEventListener("click",exportCsv);$("exportSummary").addEventListener("click",exportSummary);
    $("clearCharts").addEventListener("click",()=>{gallery.forEach((_,i)=>{const c=Chart.getChart($(`galleryChart${i}`));if(c)c.destroy();});gallery=[];renderGallery();toast("Gallery cleared.");});
    $("menuToggle").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
    document.querySelectorAll(".nav-link").forEach(a=>a.addEventListener("click",()=>$("sidebar").classList.remove("open")));
  }
  if(typeof Chart==="undefined"){document.addEventListener("DOMContentLoaded",()=>toast("Chart.js could not load. Check your internet connection and refresh."));}
  else document.addEventListener("DOMContentLoaded",init);
})();