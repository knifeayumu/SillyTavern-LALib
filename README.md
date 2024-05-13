# LALib

Library of STScript commands.


- Boolean Operations (test, and, or, not)
- List Operations (foreach, map, filter, find, slice, shuffle, dict, keys)
- Split & Join (split, join)
- Text Operations (trim, diff, json-pretty, substitute, wordcount, sentencecount, segment)
- Regular Expressions (re-test, re-replace)
- Accessing & Manipulating Structured Data (getat, setat)
- Exception Handling (try, catch)
- Null Handling (ifempty, ifnullish)
- Copy & Download (copy, download)
- DOM Interaction (dom)
- Group Chats (memberpos)
- Conditionals - switch (switch, case)
- Conditionals - if (ife, elseif, else, then)
- World Info (wi-list-books, wi-list-entries)
- Costumes / Sprites (costumes)
- Quick Replies (qr-edit, qr-add)
- Chat Messages (swipes-get, swipes-list, swipes-count, swipes-index, swipes-add, swipes-del, swipes-go, swipes-swipe, message-edit)
- Time & Date (timestamp)
- Async (fireandforget)





## Requirements

- [Costumes Plugin](https://github.com/LenAnderson/SillyTavern-Costumes.git) for `/costumes` command.






## Commands







### Help



#### `/lalib?`
Lists LALib commands

##### Examples

```stscript
/lalib?
```







### Boolean Operations



#### `/test`
`left=val rule=rule right=val`


<div>
Compares the value of the left operand <code>a</code> with the value of the right operand <code>b</code>,
and returns the result of the comparison (true or false).
</div>
<div>
Numeric values and string literals for left and right operands supported.
</div>
<div>
<strong>Available rules:</strong>
<ul>
<li>gt => a > b</li>
<li>gte => a >= b</li>
<li>lt => a < b</li>
<li>lte => a <= b</li>
<li>eq => a == b</li>
<li>neq => a != b</li>
<li>not => !a</li>
<li>in (strings) => a includes b</li>
<li>nin (strings) => a not includes b</li>
</ul>
</div>


##### Examples

```stscript
/setvar key=x 1 |
/setvar key=y 2 |
/test left={{getvar::x}} rule=eq right={{getvar::y}} |
/echo The result will be "false": {{pipe}}
```

```stscript
/setvar key=x 1 |
/setvar key=y 2 |
/test left={{getvar::x}} rule=lt right={{getvar::y}} |
/echo The result will be "true": {{pipe}}
```





#### `/and`
`left=val right=val`


Returns true if both left and right are true, otherwise false.

##### Examples

```stscript
/and left=true right=false |
/echo The result will be "false": {{pipe}}
```

```stscript
/and left=true right=true |
/echo The result will be "true": {{pipe}}
```





#### `/or`
`left=val right=val`


Returns true if at least one of left and right are true, false if both are false.

##### Examples

```stscript
/or left=true right=false |
/echo The result will be "true": {{pipe}}
```

```stscript
/or left=false right=false |
/echo The result will be "false": {{pipe}}
```





#### `/not`
`(value)`


Returns true if value is false, otherwise true.

##### Examples

```stscript
/not true |
/echo The result will be "false": {{pipe}}
```

```stscript
/not false |
/echo The result will be "true": {{pipe}}
```







### List Operations



#### `/foreach`
`[optional list=[1,2,3]] [optional var=varname] [optional globalvar=globalvarname] (/command {{item}} {{index}})`


Executes the provided command for each item of a list or dictionary, replacing {{item}} and {{index}} with the current item and index.

##### Examples

```stscript
/setvar key=x ["A", "B", "C"] |
/foreach var=x {:
    /echo Item {{index}} is {{item}} |
    /delay 400
:}
```

```stscript
/foreach list={"a":"foo","b":"bar"} {:
    /echo Item {{index}} is {{item}} |
    /delay 400
:}
```





#### `/map`
`[optional asList=true] [optional list=[1,2,3]] [optional var=varname] [optional globalvar=globalvarname] (/command {{item}} {{index}})`


<div>
Executes a command for each item of a list or dictionary and returns the list or dictionary of the command results.
</div>


##### Examples

```stscript
/setvar key=x [1,2,3] |
/map var=x {:
    /mul {{item}} {{item}}
:} |
/echo Squares: {{pipe}}
```

```stscript
/map list={"a":"foo","b":"bar"} {:
    /return This is item {{index}} with value {{item}}
:} |
/echo
```

```stscript
/map asList=True list={"a":"foo","b":"bar"} {:
    /return This is item {{index}} with value {{item}}
:} |
/echo
```





#### `/filter`
`[optional list=[1,2,3]] [optional var=varname] [optional globalvar=globalvarname] (/command {{item}} {{index}})`


<div>
Executes command for each item of a list or dictionary and returns the list or dictionary of only those items where the command returned true.
</div>


##### Examples

```stscript
/setvar key=x [1,2,3,4,5,6,7,8,9,10] |
/filter var=x {:
    /mod {{item}} 2 |
    /test left={{pipe}} rule=eq right=0
:} |
/echo Only even numbers: {{pipe}}
```

```stscript
/filter list={"a":"foo","b":"bar"} {:
    /test left={{item}} rule=in right=a
:} |
/echo Only items that include an "a": {{pipe}}
```





#### `/find`
`[optional list=[1,2,3]] [optional var=varname] [optional globalvar=globalvarname] (/command {{item}} {{index}})`


<div>
Executes the provided command for each item of a list or dictionary and returns the first item where the command returned true.
</div>


##### Examples

```stscript
/setvar key=x [2,4,6,8,10] |
/find var=x {:
    /test left={{item}} rule=gt right=5
:} |
/echo The first item greater than 5: {{pipe}}
```

```stscript
/find list={"a":"foo","b":"bar","c":"foobar","d":"barfoo"} {:
    /len {{item}} |
    /test left={{pipe}} rule=gt right=3
:} |
/echo The first item longer than 3 characters: {{pipe}}
```





#### `/slice`
`start=int [optional end=int] [optional length=int] [optional var=varname] [optional globalvar=globalvarname] (optional value)`


<div>
Retrieves a slice of a list or string.
</div>


##### Examples

```stscript
/setvar key=x [1,2,3,4,5] |
/slice var=x start=2 |
/echo The result will be "[3,4,5]": {{pipe}}
```

```stscript
/slice start=-3 foo bar |
/echo The result will be "bar": {{pipe}}
```





#### `/shuffle`
`(list to shuffle)`


Returns a shuffled list.

##### Examples

```stscript
/shuffle [1,2,3,4,5] |
/echo
```





#### `/dict`
`[optional var=varname] [optional globalvar=globalvarname] (list of lists)`


<div>
Takes a list of lists (each item must be a list of at least two items) and creates a dictionary by using each
items first item as key and each items second item as value.
</div>


##### Examples

```stscript
/setvar key=x [
    ["a", 1],
    ["b", 2],
    ["c", 3]
] |
/dict var=x |
/echo
```





#### `/keys`
`[optional var=varname] [optional globalvar=globalvarname] (dictionary)`


Return the list of keys of a dictionary / object.

##### Examples

```stscript
/keys list={"a":"foo","b":"bar","c":"foobar","d":"barfoo"} |
/echo
```







### Split & Join



#### `/split`
`[optional find=","] [optional trim=true|false] [optional var=varname] [optional globalvar=globalvarname] (value)`


<div>
Splits value into list at every occurrence of find. Supports regex <code>find="/\\s/"</code>
</div>


##### Examples

```stscript
/split foo, bar |
/echo The result will be ["foo", "bar"]: {{pipe}}
```

```stscript
/split find=/o.+?o/g The quick brown fox jumps over the lazy dog. |
/echo The result will be ["The quick br", "x jumps", "g."]: {{pipe}}
```





#### `/join`
`[optional glue=", "] [optional var=varname] [optional globalvar=globalvarname] (optional list)`


<div>
Joins the items of a list with glue into a single string. Use <code>glue={{space}}</code> to join with a space.
</div>


##### Examples

```stscript
/setvar key=x ["a","b","c"] |
/join var=x |
/echo The result will be "a, b, c": {{pipe}}
```

```stscript
/join glue=::: ["foo", "bar"] |
/echo The result will be "foo:::bar": {{pipe}}
```







### Text Operations



#### `/trim`
`(text to trim)`


Removes whitespace at the start and end of the text.

##### Examples

```stscript
/return [" foo", "bar "] |
/getat index=0 |
/trim |
/echo
```





#### `/diff`
`[optional all=true] [optional buttons=true] [optional stripcode=true] [optional notes=text] [old=oldText] [new=newText]`


Compares old text vs new text and displays the difference between the two. Use <code>all=true</code> to show new, old, and diff side by side. Use <code>buttons=true</code> to add buttons to pick which text to return. Use <code>stripcode=true</code> to remove all codeblocks before diffing. Use <code>notes="some text"</code> to show additional notes or comments above the comparison.

##### Examples

```stscript
/echo comparing the last two messages |

/sub {{lastMessageId}} 1 |
/messages names=off |
/split find=``` |
/getat index=-1 |
/let old {{pipe}} |
/setvar key=old {{var::old}} |

/messages names=off {{lastMessageId}} |
/split find=``` |
/getat index=-1 |
/let new {{pipe}} |
/setvar key=new {{var::new}} |

/diff old={{var::old}} new={{var::new}}
```

```stscript
/diff old="The quick brown fox jumps over the lazy dog." new="The fast spotted fox jumps across the sleeping dog." notes="Foxes and dogs." all=true
```





#### `/json-pretty`
`(JSON)`


Pretty print JSON.

##### Examples

```stscript
/json-pretty {"a":1, "b":[1,2,3]} |
/send ```json{{newline}}{{pipe}}{{newline}}```
```





#### `/substitute`
`(text)`


Substitute macros in text.

##### Examples

```stscript
/setvar key=x char |
/setvar key=y user |
/substitute {{{{getvar::x}}}} |
/echo x turns into the char name: {{pipe}} |
/delay 500 |
/substitute {{{{getvar::y}}}} |
/echo and y turns into the persona name: {{pipe}} |
```





#### `/wordcount`
`[optional language=lang] (text)`


Count the number of words in text. Language defaults to "en". Supply a two character language according to IETF BCP 47 language tags for other languages.

##### Examples

```stscript
/wordcount The quick brown fox jumps over the lazy dog. |
/echo The result will be nine: {{pipe}}
```





#### `/sentencecount`
`[optional language=lang] (text)`


Count the number of sentences in text. Language defaults to "en". Supply a two character language according to IETF BCP 47 language tags for other languages.

##### Examples

```stscript
/sentencecount The quick brown fox jumps over the lazy dog. Does the quick brown fox jump over the lazy dog? |
/echo The result will be two: {{pipe}}
```





#### `/segment`
`[granularity=grapheme|word|sentence] [optional language=lang] (text)`


Return the graphemes (characters, basically), words or sentences found in the text. Supply a two character language according to IETF BCP 47 language tags for other languages.

##### Examples

```stscript
/segment granularity=sentence  The fox. The dog. |
/echo The two sentences are: {{pipe}}
```

```stscript
/segment granularity=word  The fox. The dog. |
/echo The four word are: {{pipe}}
```







### Regular Expressions



#### `/re-test`
`[find=/pattern/flags] [optional var=varname] [optional globalvar=globalvarname] (optional value)`


Tests if the provided variable or value matches a regular expression.

##### Examples

```stscript
/re-test find=/dog/i The quick brown fox jumps over the lazy dog. |
/echo result will be true: {{pipe}}
```

```stscript
// pipes in the regex must to be escaped |
/re-test find=/dog\|cat/i The quick brown fox jumps over the lazy dog. |
/echo result will be true: {{pipe}}
```

```stscript
// if you want to find a literal pipe, you have to also escape the backslash escaping it |
/re-test find=/dog\\\|cat/i The quick brown fox jumps over the lazy dog. |
/echo result will be false: {{pipe}}
```

```stscript
// or you can put quote around the regex and forget about escaping... |
/re-test find="/dog|cat/i" The quick brown fox jumps over the lazy dog. |
/echo result will be true ("dog" or "cat"): {{pipe}} |
/delay 500 |
/re-test find="/dog\|cat/i" The quick brown fox jumps over the lazy dog. |
/echo result will be false (only matching "dog\|cat"): {{pipe}}
```





#### `/re-replace`
`[find=/pattern/flags] [optional replace=replaceText] [optional cmd=closure|command] [optional var=varname] [optional globalvar=globalvarname] (optional value)`


<div>
Searches the provided variable or value with the regular expression and replaces matches with the replace value or the return value of the provided closure or slash command. For text replacements and slash commands, use <code>$1</code>, <code>$2</code>, ... to reference capturing groups. In closures use <code>{{$1}}</code>, <code>{{$2}}</code>, ... to reference capturing groups.
</div>


##### Examples

```stscript
// simple find and replace |
/re-replace find=/dog/i replace=cat The quick brown fox jumps over the lazy dog. |
/echo result will be "[...] the lazy cat.": {{pipe}}
```

```stscript
// Use $1, $2, ... to reference capturing groups. |
/re-replace find="/\b(\w+)\b dog/i" replace="cat $1" The quick brown fox jumps over the lazy dog.
/echo result will be "[...] over the cat lazy.": {{pipe}}
```

```stscript
// You can also use the return value of another command or closure as the replacement text. |
// In closures use {{$1}}, {{$2}}, ... to reference capturing groups. |
/re-replace
    find=/(fox\|dog)/ig
    cmd={:
        /input replace {{$1}} with:
    :}
    The quick brown fox jumps over the lazy dog.
|
/echo who jumps over who now? {{pipe}}
```







### Accessing & Manipulating Structured Data



#### `/getat`
`index=int|fieldname|list [optional var=varname] [optional globalvar=globalvarname] (optional value)`


Retrieves an item from a list or a property from a dictionary.

##### Examples

```stscript
/setvar key=x {
    "a": [
        1,
        2,
        {
            "b": "foo",
            "c": "bar"
        }
    ],
    "d": "D"
} |
/getat var=x index=d |
/echo The result will be "D": {{pipe}}
```

```stscript
/return {
    "a": [
        1,
        2,
        {
            "b": "foo",
            "c": "bar"
        }
    ],
    "d": "D"
} |
/getat index=["a", 2, "b"] |
/echo The result will be "foo": {{pipe}}
```

```stscript
/return {
    "a": [
        1,
        2,
        {
            "b": "foo",
            "c": "bar"
        }
    ],
    "d": "D"
} |
/getat index=a |
/getat index=2 |
/getat index=c |
/echo The result will be "bar": {{pipe}}
```





#### `/setat`
`index=int|fieldname|list [optional var=varname] [optional globalvar=globalvarname] [optional value=list|dictionary] (value)`


<div>
Sets an item in a list or a property in a dictionary.
</div>


##### Examples

```stscript
/setvar key=x {
    "a": [
        1,
        2,
        {
            "b": "foo",
            "c": "bar"
        }
    ],
    "d": "D"
} |
/setat var=x index=d new value for D |
/echo {{getvar::x}}
```

```stscript
/setvar key=x {
    "a": [
        1,
        2,
        {
            "b": "foo",
            "c": "bar"
        }
    ],
    "d": "D"
} |
/setat var=x index=["a", 2, "c"] new value for bar |
/echo {{getvar::x}}
```

```stscript
/flushvar x |
/setat var=x index=["a","b",2] creating new objects or list |
/echo {{getvar::x}}
```







### Exception Handling



#### `/try`
`(command)`


<div>
Attempts to execute the provided command and catches any exceptions thrown. Use with <code>/catch</code>.
</div>


##### Examples

```stscript
/echo Try this first while being connected to an LLM, then without a connection. |
/setvar key=myPrompt Say hello! |
/try {:
	/getvar myPrompt |
	/gen {{pipe}}
:} |
/catch pipe={{pipe}} {:
	/echo something went wrong: {{error}} |
	/return "gen failed :("
:} |
/echo {{pipe}}
```





#### `/catch`
`[pipe={{pipe}}] (command)`


<div>
Used with the \`/try\` command to handle exceptions. Use \`{{exception}}\` or \`{{error}}\` to get the exception's message.
</div>


##### Examples

```stscript
see /try
```







### Null Handling



#### `/ifempty`
`[value=valueToCheck] (fallbackValue)`


Returns the fallback value if value is empty (empty string, empty list, empty dictionary).

##### Examples

```stscript
/ifempty value=[] [1,2,3] |
/echo will be [1,2,3]: {{pipe}}
```

```stscript
/setvar key=x |
/setvar key=y bar |
/ifempty value={{getvar::x}} foo |
/echo will be foo: {{pipe}} |
/ifempty value={{getvar::y}} foo |
/echo will be bar: {{pipe}} |
```





#### `/ifnullish`
`[value=valueToCheck] (fallbackValue)`


Returns the fallback value if value is nullish (empty string).

##### Examples

```stscript
/ifnullish value=[] [1,2,3] |
/echo will be []: {{pipe}}
```

```stscript
/setvar key=x |
/setvar key=y bar |
/ifnullish value={{getvar::x}} foo |
/echo will be foo: {{pipe}} |
/ifnullish value={{getvar::y}} foo |
/echo will be bar: {{pipe}} |
```







### Copy & Download



#### `/copy`
`(value)`


Copies value into clipboard.

##### Examples

```stscript
/copy this text is now in your clipboard
```

```stscript
/copy {{lastMessage}}
```





#### `/download`
`[optional name=filename] [optional ext=extension] (value)`


Downloads value as a text file.

##### Examples

```stscript
/download Let's download this text.
```

```stscript
/download name=TheLastMessage ext=md {{lastMessage}}
```







### DOM Interaction



#### `/dom`
`[action=click|value|property] [optional value=newValue] [optional property=propertyName] [optional attribute=attributeName] (CSS selector)`


<div>
Click on an element, change its value, retrieve a property, or retrieve an attribute. To select the targeted element, use CSS selectors.
</div>


##### Examples

```stscript
/dom action=click #fast_ui_mode |
/echo Toggled "No Blur Effect" setting
```

```stscript
/dom action=value value=0 #avatar_style |
/echo Avatar style has been set to "Circle"
```

```stscript
/dom action=property property=value #avatar_style |
/echo Current avatar style: {{pipe}}
```

```stscript
/dom action=attribute attribute=is_system #chat > .mes:last-child |
/echo Is the last message a system message? {{pipe}}
```







### Group Chats



#### `/memberpos`
`(name) (position)`


Move group member to position (index starts with 0).

##### Examples

```stscript
/memberpos Alice 3 |
/echo Alice has been moved to position 3
```







### Conditionals - switch



#### `/switch`
`[optional var=varname] [optional globalvar=globalvarname] (optional value)`


Use with /case to conditionally execute commands based on a value.

##### Examples

```stscript
/setvar key=x foo |
/switch var=x |
    /case pipe={{pipe}} value=1 {: /echo value is one :} |
    /case pipe={{pipe}} value=foo {: /echo value is foo :} |
    /case pipe={{pipe}} value=bar {: /echo value is bar :} |
/echo done
```





#### `/case`
`[pipe={{pipe}}] [value=comparisonValue] (/command)`


Execute a command if the provided value matches the switch value from /switch.

##### Examples

```stscript
see /switch
```







### Conditionals - if



#### `/ife`
`(/command)`


<div>Use with /then, /elseif, and /else. The provided command must return true or false.</div>

##### Examples

```stscript
/setvar key=x foo |
/ife {: /test left=x rule=eq right=1 :} |
    /then {: /echo value is one :} |
/elseif {: /test left=x rule=eq right=foo :} |
    /then {: /echo value is foo :} |
/elseif {: /test left=x rule=eq right=bar :} |
    /then {: /echo value is bar :} |
/else {: /echo value is something else :} |
```





#### `/elseif`
`(/command)`


<div>Use with /ife, /then, and /else. The provided command must return true or false.</div>

##### Examples

```stscript
see /ife
```





#### `/else`
`(/command)`


<div>Use with /ife, /elseif, and /then. The provided command will be executed if the previous /if or /elseif was false.</div>

##### Examples

```stscript
see /ife
```





#### `/then`
`(/command)`


<div>Use with /ife, /elseif, and /else. The provided command will be executed if the previous /if or /elseif was true.</div>

##### Examples

```stscript
see /ife
```







### World Info



#### `/wi-list-books`
`[optional source=true]`


Get a list of currently active World Info books. Use <code>source=true</code> to get a dictionary of lists where the keys are the activation sources.

##### Examples

```stscript
/wi-list-books |
/echo The currently active WI books are: {{pipe}}
```

```stscript
/wi-list-books source=true |
/json-pretty |
/comment Currently active WI books:{{newline}}```json{{newline}}{{pipe}}{{newline}}```
```





#### `/wi-list-entries`
`[optional flat=true] (optional book name)`


Get a list of World Info entries from currently active books or from the book with the provided name. Use <code>flat=true</code> to list all entries in a flat list instead of a dictionary with entries per book.

##### Examples

```stscript
/wi-list-entries |
/map list={{pipe}} {:
    /getat index=entries {{item}} |
    /map list={{pipe}} {:
        /getat index=comment {{item}}
    :}
:} |
/echo Overview of WI entries in currently active books: {{pipe}}
```







### Costumes / Sprites



#### `/costumes`
`[optional recurse=false] (folder)`


Get a list of costume / sprite folders, recursive by default.

##### Examples

```stscript
/costumes Alice | /echo Alice's costumes: {{pipe}}
```

```stscript
/costumes Alice/Winter | /echo Alice's winter costumes: {{pipe}}
```

```stscript
/costumes recurse=false Alice | /echo Alice's top-level costumes only: {{pipe}}
```







### Quick Replies



#### `/qr-edit`
`[optional set=qrSetName] [optional label=qrLabel] (optional qrLabel)`


Show the Quick Reply editor. If no QR set is provided, tries to find a QR in one of the active sets.

##### Examples

```stscript
/qr-edit My QR From An Active Set
```

```stscript
/qr-edit set=MyQrSet label=MyQr
```





#### `/qr-add`
`[optional set=qrSetName] [optional label=qrLabel] (optional qrLabel)`


Create a new Quick Reply and open its editor. If no QR set is provided, tries to find a QR in one of the active sets.

##### Examples

```stscript
/qr-add New QR In Active Set
```

```stscript
/qr-add set=MyQrSet label=MyNewQr
```







### Chat Messages



#### `/swipes-get`
`[optional message=messageId] (index)`


Get the n-th swipe (zero-based index) from the last message or the message with the given message ID.

##### Examples

```stscript
/swipes-get 5 |
/echo Swipe number five: {{pipe}}
```

```stscript
/sub {{lastMessageId}} 2 |
/swipes-countget message={{pipe}} 5 |
/echo swipe number five: {{pipe}}
```





#### `/swipes-list`
`[optional message=messageId]`


Get a list of all swipes from the last message or the message with the given message ID.

##### Examples

```stscript
/swipes-list |
/echo
```

```stscript
/sub {{lastMessageId}} 2 |
/swipes-list message={{pipe}} |
/echo
```





#### `/swipes-count`
`[optional message=messageId]`


Get the number of all swipes from the last message or the message with the given message ID.

##### Examples

```stscript
/swipes-count |
/echo
```

```stscript
/sub {{lastMessageId}} 2 |
/swipes-count message={{pipe}} |
/echo
```





#### `/swipes-index`
`[optional message=messageId]`


Get the current swipe index from the last message or the message with the given message ID.

##### Examples

```stscript
/swipes-index |
/echo
```

```stscript
/sub {{lastMessageId}} 2 |
/swipes-index message={{pipe}} |
/echo
```





#### `/swipes-add`
`[optional message=messageId] (text)`


Add a new swipe to the last message or the message with the provided messageId.

##### Examples

```stscript
/sendas name=Alice foo |
/delay 1000 |
/swipes-add bar
```





#### `/swipes-del`
`[optional message=messageId] (optional index)`


Delete the current swipe or the swipe at the specified index (0-based).

##### Examples

```stscript
/sendas name=Alice foo |
/delay 1000 |
/swipes-add bar |
/delay 1000 |
/swipes-del
```

```stscript
/sendas name=Alice foo |
/delay 1000 |
/swipes-add bar |
/delay 1000 |
/swipes-add foobar |
/delay 1000 |
/swipes-del 0
```





#### `/swipes-go`
`[optional message=messageId] (index)`


Go to the swipe. 0-based index.

##### Examples

```stscript
/sendas name=Alice foo |
/delay 1000 |
/swipes-add bar |
/delay 1000 |
/swipes-add foobar |
/delay 1000 |
/swipes-go 0
```





#### `/swipes-swipe`
Trigger a new swipe on the last message.

##### Examples

```stscript
/swipes-swipe |
/echo swiping has finished
```





#### `/message-edit`
`[optional message=messageId] [optional append=true] (new text)`


Edit the current message or the message at the provided message ID. Use <code>append=true</code> to add the provided text at the end of the message. Use <code>{{space}}</code> to add space at the beginning of the text.

##### Examples

```stscript
/sendas name=Alice foo |
/delay 1000 |
/message-edit bar
```

```stscript
/sendas name=Alice foo |
/delay 1000 |
/message-edit append=true bar
```







### Time & Date



#### `/timestamp`
Returns the number of milliseconds midnight at the beginning of January 1, 1970, UTC.

##### Examples

```stscript
/timestamp |
/echo
```







### Async



#### `/fireandforget`
`(command)`


Execute a closure or command without waiting for it to finish.

##### Examples

```stscript
/fireandforget {:
    /delay 1000 |
    /echo firing |
    /delay 1000 |
    /echo still firing
:} |
/echo outside
```







### Undocumented



#### `/fetch`
`(url)`


UNDOCUMENTED

##### Examples

```stscript
/fetch http://example.com |
/echo
```





#### `/$`
`[optional query=cssSelector] [optional take=property] [optional call=property] (html)`


UNDOCUMENTED

##### Examples

```stscript
/fetch http://example.com |
/$ query=h1 take=textContent |
/echo
```





#### `/$$`
`[optional query=cssSelector] [optional take=property] [optional call=property] (html)`


UNDOCUMENTED

##### Examples

```stscript
/fetch http://example.com |
/$$ query=p call=remove |
/echo
```

