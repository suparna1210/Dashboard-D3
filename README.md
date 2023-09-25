# Coursework

_**F20DV/F21DV coursework template**_

The coursework template. d3.js version 4 code.


**Important - Python http.server**


e.g. in a Command window run:

```
cd <your directory>
C:\ProgramData\Anaconda3\python -m http.server 8000
```

Then point Chrome at `localhost:8000`

For longer term use create a .bat file:

```
cd <your directory>
echo "Now vist: localhost:8000 after web server start up"
C:\ProgramData\Anaconda3\python -m http.server 8000
pause
```

### Notes

Under Windows: if you cannot find python at `C:\ProgramData\Anaconda3` do a search for `python.exe` and edit the path above.

If you don't run a local server you will get errors such as

`Access to XMLHttpRequest at 'file:...csv' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, etc.`
