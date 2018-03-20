# node-h2-server-push

I *forked* this example and changed they way we decide which programs should be **push**ed.

I added this to the main **app.use() function that does all the work.
```
  let file = fs.readFileSync(path.join(__dirname, 'public', `${urlName}`), {encoding: 'utf8'})
             .split('\n')
             .filter(line => line.match(/(?:src|href)\s*=\s*[\'\"](.*)[\'\"]/) != null)
             .map(line => line.match(/(?:src|href)\s*=\s*[\'\"](.*)[\'\"]/)[1]);
```

I also added a module that was missing in the *package.json*: **neo-async**.
Also added **mime**.

I think this is a better approach.
