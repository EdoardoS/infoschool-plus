/**
 * Classe per la gestione della pagina dei voti.
 */
function PaginaVoti() {
  
  /**
   * Costruttore
   */
  this.materie = new Array();
  
  /**
   * Metodo che legge i dati dalla pagina originaria e crea una struttura di dati con materie e voti.
   * @return Un array di oggetti Materia che contengono i voti.
   */
  this.getVotiDaPagina = function(pagina) {
    
    var j=0, y=0, classe, nome, materia, voto, nodoVoto, data, dataGiorno, dataMese, tipo, periodo;
    var righeVoti = new Array();
    
    var tabellaVoti = pagina.getElementById("data_table_2");
    var righeTabella = tabellaVoti.getElementsByTagName("tr");
    
    for(var i = 0; i<righeTabella.length; i++) {
      classe = righeTabella[i].className;
      if(classe.indexOf("rigtab")>=0){
        righeVoti[j]=righeTabella[i];
        j++;
      }
    }
    
    for(var i=0; i<righeVoti.length; i++) {
      
      nome = righeVoti[i].getElementsByTagName("td")[1].innerHTML;
      nome = nome.replace("&nbsp","");
      nome = nome.replace(";","");
      materia = this.materie[i] = new Materia(nome);
      
      y=0;
      for(var j= 2; j <= 31; j++) {
        nodoVoto = righeVoti[i].getElementsByTagName("td")[j].getElementsByTagName("p")[0];
        voto = nodoVoto.innerHTML;
        if(parseInt(voto)){
          
          voto = parseInt(voto);
          data = nodoVoto.parentNode.parentNode.getElementsByClassName("voto_data")[0].innerHTML;
          data = data.split("/");
          dataGiorno = parseInt(data[0]);
          dataMese = parseInt(data[1]);
          if( (j>=2&&j<=6) || (j>=17&&j<=21) )
            tipo = "Scritto/Grafico";
          if( (j>=7&&j<=11) || (j>=22&&j<=26) )
            tipo = "Orale";
          if( (j>=12&&j<=16) || (j>=27&&j<=31) )
            tipo = "Orale";
          if( j>=2&&j<=16 )
            periodo = "primo";
          else
            periodo = "secondo";
            
          materia.aggiungiVoto(voto,tipo,dataGiorno,dataMese,periodo,"Lorem ipsum");

          y++;
        }
      
      }
      
      materia.voti = materia.getVotiOrdinatiPerData();
      
    }
    
  }

  /**
   * Metodo che restituisce la tabella dei voti in html.
   * @param voti Un array di oggetti Materia che contengono i voti.
   * @return La tabella dei voti in html.
   */
  this.getTabellaVotiHtml = function() {
    
    var tabellaVotiHtml = "", materia, marginLeft, marginRight, valoreVoto;
    var coloriVoti = new Array("#A0522D","#A0522D","#A0522D","#A0522D","#A0522D","#FFDEAD","#FFFACD","#8FBC8F","#3CB371","#6B8E23","#556B2F");
    
    tabellaVotiHtml += '<div id="tabellaVoti">';
    tabellaVotiHtml += '<script src="'+chrome.extension.getURL("/")+'js/Chart.js"></script>';
    
    for(var i=0; i<this.materie.length; i++) {
      
      materia = this.materie[i];
      
      tabellaVotiHtml += '<div class="rigaMateria" id="riga'+materia.nome.replace(" ","_")+'">';
      tabellaVotiHtml += '<div class="nomeMateria">'+materia.nome+'</div>';
      
      tabellaVotiHtml += '<div class="votiEGrafico">';
      
      tabellaVotiHtml += '<canvas id="grafico'+materia.nome.replace(/[^A-Za-z0-9]/g,'')+'" class="graficoMateria" height="120" width="880"></canvas>';
      tabellaVotiHtml += '<script>';
      tabellaVotiHtml += 'var ctx = document.getElementById("grafico'+materia.nome.replace(/[^A-Za-z0-9]/g,'')+'").getContext("2d");';
      tabellaVotiHtml += 'var data={labels:[';
      for(var j=0; j<materia.voti.length; j++) {
        tabellaVotiHtml += '"'+materia.voti[j].giornoData+' / '+materia.voti[j].meseData+'"';
        if(materia.voti.length!=j-1)
          tabellaVotiHtml += ',';
      }
      tabellaVotiHtml += '],datasets:[{fillColor:"rgba(220,220,220,0.5)",strokeColor:"rgba(220,220,220,1)",pointColor:"rgba(220,220,220,1)",pointStrokeColor:"#fff",data:[';
      for(var j=0; j<materia.voti.length; j++) {
        tabellaVotiHtml += materia.voti[j].valore;
        if(materia.voti.length!=j-1)
          tabellaVotiHtml += ',';
      }
      tabellaVotiHtml += ']}]};';
      tabellaVotiHtml += 'new Chart(ctx).Line(data);';
      tabellaVotiHtml += '</script>';
      
      tabellaVotiHtml += '<div class="bloccoVoti">';
      for(var j=0; j<materia.voti.length; j++) {
        marginLeft = marginRight = (850/((materia.voti.length*2)-2))-14-(24/materia.voti.length);
        if(j==0)
          marginLeft = 0;
        if(j==materia.voti.length-1)
          marginRight = 0;
        valoreVoto = materia.voti[j].valore;
        tabellaVotiHtml += '<div class="voto voto' + valoreVoto + '" style="margin-left:'+marginLeft+'px;margin-right:'+marginRight+'px;background-color:'+coloriVoti[valoreVoto]+'">';
        tabellaVotiHtml += valoreVoto;
        tabellaVotiHtml += '<div class="infoVoto">data:'+materia.voti[j].giornoData+' / '+materia.voti[j].meseData+'<br>'+materia.voti[j].tipo+'</div>';
        tabellaVotiHtml += '</div>';
      }
           
      tabellaVotiHtml += "</div></div></div>";
      
    }
    
    tabellaVotiHtml += "</div>";
    
    return tabellaVotiHtml;

  }




}



/**
 * Classe per la gestione dei dati di una materia.
 */
function Materia(nomeMateria) {
  
  /**
   * Costruttore
   */
  this.nome = nomeMateria;
  this.voti = new Array();
  
  /**
   * Metodo che aggiunge un voto.
   */
  this.aggiungiVoto = function(valoreVoto, tipoVoto, giornoDataVoto, meseDataVoto, periodoVoto, commentoVoto) {
    
    this.voti[this.voti.length] = new Voto(valoreVoto, tipoVoto, giornoDataVoto, meseDataVoto, periodoVoto, commentoVoto);
    
  }
      
  /**
   * Metodo che restituisce la media.
   */
  this.media = function() {
    
    var media=0;
    for(var i = 0; i<this.voti.length; i++)
      media+=this.voti[i];
    media = media/this.voti.length;
    media = math.round(media);
    
    return media;
    
  }
  
  /**
   * Metodo che restituisce i voti di una materia in ordine cronologico.
   */
  this.getVotiOrdinatiPerData = function() {
    
    return this.voti.sort( valutaDataPeriodo );
    
    function valutaDataPeriodo(a, b) {
      if(a.periodo==b.periodo)
        return a.getDataMeseGiorno() > b.getDataMeseGiorno();
      else
        if(a.periodo=='primo')
          return -1;
        else
          return 1;
    }
    
  }
  
}

/**
 * Classe per la gestione di un voto.
 */
function Voto(valoreVoto, tipoVoto, giornoDataVoto, meseDataVoto, periodoVoto, commentoVoto) {
  
  /**
   * Costruttore.
   */
  this.valore = valoreVoto;
  this.tipo = tipoVoto;
  this.giornoData = giornoDataVoto;
  this.meseData = meseDataVoto;
  this.periodo = periodoVoto;
  this.commento = commentoVoto;
  
  /**
   * metodo che restituisce la data in formato "mesegiorno".
   */
  this.getDataMeseGiorno = function() {
    
    var giornoDoppiaCifra, meseDeppiaCifra;
    
    if(this.giornoData<10)
      giornoDoppiaCifra = '0'+this.giornoData;
    else
      giornoDoppiaCifra = this.giornoData;
      
    if(this.meseData<10)
      meseDoppiaCifra = '0'+this.meseData;
    else
      meseDoppiaCifra = this.meseData;
    
    return parseInt(meseDoppiaCifra + '' + giornoDoppiaCifra);
    
  }
  
}
