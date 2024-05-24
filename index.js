
let filediv = document.getElementById("file_zone");
let console = document.getElementById("console_zone");

function Log(s)
{
    console.innerHTML += s + "\n";
}

function dropHandler(ev) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    ev.stopPropagation();

    let files = ev.dataTransfer.files; // Get the dropped files
    if (files.length > 0) {
        let file = files[0]; // Get the first file (assuming only one file is dropped)
        if (file.type.match('text/plain')) { // Check if it's a text file
            let reader = new FileReader();
            reader.onload = function (e) {
                let contents = e.target.result;
                Log("File uploaded successfully.")
                filediv.innerHTML = contents;
            };
            reader.readAsText(file); // Read the file as text
        } else {
            Log('ERROR. Please drop a text file.');
        }
    }
}

function dragOverHandler(ev) {
    // Log("File(s) in drop zone");

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
}
