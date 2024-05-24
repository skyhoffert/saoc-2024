
let GLOB = {
    "font-size": 18,
    "arrow-start-x": 532,
    "arrow-start-y": -15,
    "arrow-incr": 22.14,
};

let coding = document.getElementById("coding-area");
let program = document.getElementById("program-area");
let workspace = document.getElementById("workspace");
let console = document.getElementById("console");
let arrow = document.getElementById("arrow");

let arrowpos = {x:0,y:-100};
let programlines = [];
let linenumbers = [];
let lineidx = 0;
let vars = {};

function Log(s)
{
    let now = new Date();
    console.innerHTML += "" + String(now.getHours()).padStart(2,"0") + ":" + String(now.getMinutes()).padStart(2,"0") + ":" + String(now.getSeconds()).padStart(2,"0") + " | ";
    console.innerHTML += "" + s + "<br>";
}

function arrow_moveto(x,y)
{
    arrowpos.x = x;
    arrowpos.y = y;
    arrow.style.top = "" + arrowpos.y + "px";
    arrow.style.left = "" + arrowpos.x + "px";
}

function arrow_movetoline(ln)
{
    arrow_moveto(arrowpos.x, GLOB["arrow-start-y"] + (GLOB["arrow-incr"]*ln));
}

function parse_variable_set(l)
{
    if ((l.match(/is/g) || []).length > 1)
    {
        return "too many = signs";
    }

    let toks = l.split(" ");
    for (let i = 0; i < toks.length; i++)
    {
        if (toks[i].length <= 0)
        {
            toks.splice(i,1);
            i = -1;
            continue;
        }
    }

    let varname = toks[0];

    if (toks[1] != "=")
    {
        return "improper variable set syntax";
    }

    let arga = toks[2];
    let act = toks[3];
    let argb = toks[4];

    if (arga == null)
    {
        return "bad arga";
    }

    if (arga[0] == "$")
    {
        if (arga in vars == false)
        {
            return "no existing variable " + arga;
        }

        arga = vars[arga];
    }
    else if (arga.indexOf(".") == -1)
    {
        arga = parseFloat(arga);
    }
    else
    {
        arga = parseInt(arga);
    }

    if (argb != null)
    {
        if (argb[0] == "$")
        {
            if (argb in vars == false)
            {
                return "no existing variable " + argb;
            }

            argb = vars[argb];
        }
        else if (argb.indexOf(".") == -1)
        {
            argb = parseFloat(argb);
        }
        else
        {
            argb = parseInt(argb);
        }
    }

    if (act == null)
    {
        vars[varname] = arga;
        return "";
    }

    if (argb == null)
    {
        Log("bad argb");
        return "";
    }

    if (act == "+")
    {
        vars[varname] = arga + argb;
        return "";
    }
    else if (act == "*")
    {
        vars[varname] = arga * argb;
        return "";
    }

    return "didn't complete properly.";
}

function parse_line(line)
{
    let ret = "";

    if (line[0] == "$")
    {
        ret = parse_variable_set(line);
        if (ret.length > 0)
        {
            Log(lineidx);
            Log("lineidx " + linenumbers[lineidx] + ", " + ret + ".");
        }
    }
    else
    {
        let toks = line.split(" ");
        let kw = toks[0];
        if (kw == "jump")
        {
            lineidx = vars[toks[1]] + 1;
            arrow_movetoline(lineidx);
            update_workspace();
            return;
        }
        else if (kw == "noop")
        {
            // nothing
        }
        else if (kw == "ask")
        {
        }
        else if (kw == "iftrue")
        {
            if (vars["ans"] == true)
            {
                // TODO
            }
        }
        else if (kw == "iffalse")
        {
            if (vars["ans"] == false)
            {
                // TODO
            }
        }
        else if (kw == "print")
        {
            let cps = "";
            let ps = toks.slice(1).join(" ");

            let idx = -1;
            let loopcnt = 0;
            
            while (ps.length > 0)
            {
                loopcnt += 1;
                if (loopcnt > 100) { break; }


                idx = ps.indexOf("\\");
                
                if (idx != -1)
                {
                    cps += ps.slice(0,idx);
                    cps += ps[idx+1];
                    ps = ps.slice(idx+2);
                    continue;
                }

                idx = ps.indexOf("$");

                if (idx != -1)
                {
                    cps += ps.slice(0,idx);
                    let varname = ps.slice(idx).split(" ")[0];
                    cps += vars[varname];
                    ps = ps.slice(idx+varname.length);
                    continue;
                }

                cps += ps;
                ps = "";
            }

            Log(cps);
        }
        else
        {
            Log("unknown line " + lineidx);
        }
    }
}

function compile_labels()
{
    for (let i = 0; i < programlines.length; i++)
    {
        let line = programlines[i];
        if (line[0] == "%")
        {
            let varname = line.split(" ")[0];
            vars[varname] = i;
        }
    }
}

function update_workspace()
{
    workspace.innerHTML = "";
    for (v in vars)
    {
        workspace.innerHTML += "" + v + " = " + vars[v] + "<br>";
    }
}

function clear_workspace()
{
    vars = {};
    vars["ans"] = false;
}

document.getElementById("run").addEventListener("click", function(evt)
{
    Log("uploading...");

    clear_workspace();

    program.innerHTML = "";
    programlines = [];
    
    let lines = coding.value.split("\n")
    for (let i = 0; i < lines.length; i++)
    {
        if (lines[i].length < 1)
        {
            continue;
        }
        if (lines[i][0] == "#")
        {
            // Skip comment lines.
            continue;
        }

        lines[i] = lines[i].replace("=", " = ");

        program.innerHTML += "&nbsp;&nbsp;&nbsp;" + String(i).padStart(2," ") + "&nbsp;" + lines[i] + "<br>";
        programlines.push(lines[i]);
        linenumbers.push(i);
    }

    arrow_moveto(GLOB["arrow-start-x"], GLOB["arrow-start-y"]);

    compile_labels();

    update_workspace();

    lineidx = 0;
});

document.getElementById("step").addEventListener("click", function (evt)
{
    let line = programlines[lineidx];

    parse_line(line);

    // Move the arrow to the following line if it is a label.
    lineidx++;
    while (lineidx < programlines.length && programlines[lineidx][0] == "%")
    {
        lineidx++;
    }
    
    // But if it goes past the end of the program, loop back to top.
    if (lineidx >= programlines.length)
    {
        lineidx = 0;
    }

    arrow_movetoline(lineidx);

    update_workspace();
});
