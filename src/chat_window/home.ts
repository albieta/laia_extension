export const home_html = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Home Interface</title>
        <style>
            body {
                margin: 0;
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                text-align: center;
            }

            .container {
                max-width: 400px; /* Adjust width as needed */
            }

            img {
                width: 200px;
                height: 200px;
                margin-bottom: 20px;
            }

            button {
                background-color: #294d4a;
                color: white;
                padding: 15px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            }

            button:hover {
                background-color: #1c3533;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img src="https://drive.google.com/thumbnail?id=1-M4VqC8yY8JOecHAkGEe6NBNLF9nzxUU" alt="Laia" style="width:150px;height:150px;">
            <p style="font-size: 20px;">Hi there! Are you ready for creating apps with LAIA? Make sure you opened an empty project before starting. When you click on "START LAIA", the base files for your project are going to be created automatically.</p>
            <button id="start-laia">START LAIA</button>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            document.getElementById('start-laia').addEventListener('click', startLaia);

            function startLaia() {
                vscode.postMessage({
                    command: 'start-laia',
                });
            }
        </script>
    </body>
</html>
`