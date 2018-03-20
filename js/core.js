function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

$(document).ready(function(){
    $("#code").linedtextarea();
    $(".lineno").click(function(){
        $(this).toggleClass("selected");
    });
});

var events = new Array(new Array());
var actions = new Array(new Array());
var debugOk;

var executing = null;
var nowState;
var nowRead;
var errore = "";

if(getCookie("info")==""){
    alert("Questo sito fa uso dei cookie, navigando al suo interno acconsenti all'utilizzo dei cookie.");
    setCookie("info", "ok", 2000);
}

if(getCookie("code")!=""){
    var code = getCookie("code").replace(/\[#nl\]/g, "\n");
    $("#code").val(code);
}

$("#code").keyup(function(){
    setCookie("code", "", 0);
    var code = $("#code").val().replace(/\n/g, "[#nl]");
    setCookie("code", code, 2000);
});

$("#comeSiUsa").click(function(){
    $(".tutorial").fadeIn(1000);
});

$(".close").click(function(){
    $(this).parent().fadeOut(1000);
});

$("#stop").click(function(){
    if($(this).hasClass("active")){
        $(this).toggleClass("active");
        clearInterval(executing);
    }
});

$(document).on("click", ".nastro div", function(){
    var nv = prompt("Che cosa ci devo mettere? (lascia vuoto per rimuovere)");
    if(nv==""){
        $(this).fadeOut(600, function() {
            $(this).remove();
        });
    }
    else{
        $(this).text(nv);
    }
    
});

$("#aggiungi").click(function(){
    var rand = Math.floor(Math.random() * 2);
    $(".nastro").append($("<div>"+rand+"</div>").hide().fadeIn(600));
});

$("#parse").click(function(){
    if(!$("#stop").hasClass("active")){
        var code = $("#code").val();
        var line = code.split("\n");
        var old;
        debugOk = true;
        
        events.length = 0;
        actions.length = 0;
        
        $(".nastro").find("div").each(function(){
            $(this).removeClass("active");
        });
        
        errore = "";

        $.when(line.forEach(debug)).done(function(){
            if(debugOk){
               execute();
            } else {
                alert(errore);
            }
        });
    }
});

function debug(item, index) {
    //old = $(".parsed").html();
    //$(".parsed").html(old+index+": "+item+"<br/>");
    item = item.replace(/ /g, "");
    if(item.indexOf("//")>-1){
        item = item.substring(0, item.indexOf("//"));
    }
    
    if(item.split(">").length == 2 & item.split(",").length == 4 & item.split("(").length == 3 & item.split(")").length == 3){
        if(debugOk){
            item = item.replace(/["'()]/g, "");
            
            var even = item.split(">")[0];
            var then = item.split(">")[1];
            
            var checkStatus = even.split(",")[0];
            var checkSymbol = even.split(",")[1];
            
            var thenStatus = then.split(",")[0];
            var thenWrite  = then.split(",")[1];
            var thenMove   = then.split(",")[2];
            
            //alert(thenMove);
            
            var eventsTmp = new Array(checkStatus, checkSymbol);
            var actionTmp = new Array(thenStatus, thenWrite, parseInt(thenMove));
            
            events.push(eventsTmp);
            actions.push(actionTmp);
        }
        //alert(checkStatus);
        $(".lineno").eq(index).removeClass("error");
        
    } else {
        $(".lineno").eq(index).addClass("error");
        
        errore += "Errore di sintassi alla linea "+(index+1)+" in "+item+"\nElenco errori:\n";
        var info = [[]];
        info[0] = [" segni maggiore (>)", 2 - item.split(">").length];
        info[1] = [" virgole", 4 - item.split(",").length];
        info[2] = [" parentesi aperte", 3 - item.split("(").length];
        info[3] = [" parentesi chiuse", 3 -item.split(")").length];

        for(var i=0;i<info.length;i++){
            if(info[i][1]!=0){
                errore += "- Mancano "
                errore += info[i][1];
                errore += info[i][0];
                errore += "\n"
            }
        }

        debugOk = false;
    }
}

function execute(){
    console.log("Debug ok, now executing...");
    
    nowState = events[0][0];
    if(nowState=="*"){
        nowState = actions[0][0];
    }
    nowRead = $(".nastro").find("div").eq(0).text();
    $("#stop").toggleClass("active");
    
    var indexRead = 0;
    $(".nastro").find("div").eq(indexRead).toggleClass("active");
    $(".testina").css("left", $(".nastro").find(".active").offset().left+"px");
        
    executing = setInterval(function(){
        for(var i=0;i<events.length;i++){
            //console.log(nowState);
            //console.log(nowState==events[i][0]);
            //console.log(nowRead.length+" e "+events[i][1].length);
            //console.log('"'+events[i][1]+'"');
            $(".statoControllato").text("("+events[i][0]+","+events[i][1]+")");
            $(".istruzione").text("("+actions[i][0]+","+actions[i][1]+","+actions[i][2]+")");
            $(".statoAttuale").text(nowState);
            
            if((nowState==events[i][0]||events[i][0]=="*")&&(nowRead==events[i][1]||events[i][1]=="*")){
                console.log("aggiorno");
                //cambia stato
                nowState = actions[i][0];
                
                //scrive nella cella
                $(".nastro").find("div").eq(indexRead).text(actions[i][1]);
                
                //cambia elemento
                $(".nastro").find("div").eq(indexRead).toggleClass("active");
                indexRead += actions[i][2];
                console.log(indexRead);
                $(".nastro").find("div").eq(indexRead).toggleClass("active");
                
                //aggiorna la lettura del nastro
                nowRead = $(".nastro").find("div").eq(indexRead).text();
                
                i=events.length; //termina le iterazioni
            }
            
            $(".testina").css("left", $(".nastro").find(".active").offset().left+"px");
        }
    }, parseInt($("#time").val()));
    
    //clearInterval(executing); (c,c) > (c,c,c)
    
    //alert(events[0][0]);
    //alert(actions);
}

$( ".debugInfo, .tutorial" ).draggable();