/* Reference and starter phrase matching only: no generated scripture or confidence probabilities. */
(function(root){
 const books='Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation'.split('|');
 const phrases=[
 ['John 3:16','god loved the world gave his only son|god so loved the world|whoever believes will not perish'],
 ['Psalm 23:1','lord is my shepherd|god is my shepherd i lack nothing|shepherd shall not want'],
 ['Philippians 4:13','i can do all things through christ|christ gives me strength to do all things|through him who strengthens me'],
 ['Romans 8:28','all things work together for good|god works everything together for good'],
 ['Jeremiah 29:11','plans to prosper you not harm you|plans for a hope and a future|thoughts of peace not evil expected end'],
 ['Proverbs 3:5-6','trust in the lord with all your heart|lean not on your own understanding|acknowledge him and he will direct your paths'],
 ['Isaiah 40:31','wait upon the lord renew their strength|soar on wings like eagles|run and not grow weary walk and not faint'],
 ['Matthew 11:28','come to me all who are weary|heavy laden i will give you rest|come unto me labour rest'],
 ['Philippians 4:6-7','be anxious for nothing|do not worry about anything pray about everything|peace of god passes all understanding'],
 ['2 Timothy 1:7','god has not given us a spirit of fear|spirit of power love and a sound mind'],
 ['Romans 12:2','do not conform to this world|be transformed by renewing your mind'],
 ['Ephesians 2:8-9','saved by grace through faith|salvation is a gift not by works'],
 ['Hebrews 11:1','faith is the substance of things hoped for|faith assurance hoped for evidence unseen'],
 ['James 2:17','faith without works is dead|faith without action is dead'],
 ['Matthew 6:33','seek first the kingdom of god|seek his kingdom and righteousness'],
 ['Matthew 5:14-16','you are the light of the world|city on a hill cannot be hidden|let your light shine before others'],
 ['Matthew 17:20','faith the size of a mustard seed|faith as a grain of mustard seed move mountain'],
 ['1 Corinthians 13:4-7','love is patient love is kind|charity suffereth long and is kind'],
 ['Galatians 5:22-23','fruit of the spirit love joy peace|fruit of the spirit patience kindness goodness'],
 ['Psalm 46:10','be still and know that i am god'],
 ['Psalm 119:105','your word is a lamp to my feet|thy word lamp unto feet light path'],
 ['Isaiah 54:17','no weapon formed against you shall prosper'],
 ['Romans 8:38-39','nothing can separate us from the love of god|neither death nor life separate love'],
 ['John 14:6','i am the way the truth and the life'],
 ['John 8:32','you shall know the truth and the truth shall make you free'],
 ['2 Corinthians 5:17','anyone in christ is a new creation|old things passed away all things become new'],
 ['2 Corinthians 12:9','my grace is sufficient for you|my strength is made perfect in weakness'],
 ['1 Peter 5:7','cast all your anxiety on him because he cares|casting all your care upon him'],
 ['Joshua 1:9','be strong and courageous do not be afraid|lord your god is with you wherever you go'],
 ['Matthew 7:7','ask and it shall be given seek and you shall find|knock and the door will be opened'],
 ['James 1:5','if any lacks wisdom let him ask god'],
 ['Romans 3:23','all have sinned and fall short of the glory of god'],
 ['Romans 6:23','wages of sin is death gift of god eternal life'],
 ['John 10:10','thief comes to steal kill destroy|i came that they might have life abundantly'],
 ['Psalm 34:18','lord is close to the brokenhearted|saves those crushed in spirit'],
 ['Lamentations 3:22-23','mercies are new every morning|great is your faithfulness mercies'],
 ['Micah 6:8','act justly love mercy walk humbly with your god'],
 ['Matthew 22:37-39','love the lord your god with all your heart|love your neighbour as yourself'],
 ['Hebrews 13:5','i will never leave you nor forsake you'],
 ['Revelation 21:4','god will wipe away every tear|no more death mourning crying pain']
 ];
 const stop=new Set('a an the and or but of to in on for is are am be been i you he she it we they my your his her our their that this with as by do does all'.split(' '));
 const norm=s=>String(s).toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
 const words=s=>new Set(norm(s).split(' ').filter(w=>w&&!stop.has(w)));
 const units='zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
 const tens={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
 function numbers(text){return text.toLowerCase().replace(/\b(first|second|third)\b/g,x=>({first:'1',second:'2',third:'3'}[x])).replace(/\b(?:one hundred(?: and)?(?: (?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[ -](?:one|two|three|four|five|six|seven|eight|nine))?| (?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen))?|(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[ -](?:one|two|three|four|five|six|seven|eight|nine))?|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)\b/g,x=>{let n=0;for(const part of x.split(/[ -]/)){if(part==='hundred')n*=100;else if(tens[part])n+=tens[part];else if(units.includes(part))n+=units.indexOf(part);}return String(n);});}
 const bookPattern=books.slice().sort((a,b)=>b.length-a.length).join('|')+'|Psalm';
 function references(text){const source=numbers(text);const re=new RegExp('\\b('+bookPattern+')\\s+(?:chapter\\s+)?(\\d{1,3})(?:\\s*:\\s*|\\s+(?:verse\\s+)?)(\\d{1,3})(?:\\s*(?:-|to|through)\\s*(\\d{1,3}))?\\b','gi');const found=[];for(const m of source.matchAll(re)){const chapter=+m[2],verse=+m[3],end=+(m[4]||m[3]);if(chapter<1||chapter>150||verse<1||verse>176||end<verse||end-verse>10)continue;const book=books.find(b=>b.toLowerCase()===m[1].toLowerCase())||'Psalms';found.push({reference:`${book} ${chapter}:${verse}${end!==verse?'-'+end:''}`,reason:'Spoken reference',score:2});}return found;}
 function match(text){const normalized=norm(text),tokens=words(text);const result=references(text);if(tokens.size>=3)for(const [reference,variants] of phrases){let best=0;for(const phrase of variants.split('|')){const expected=words(phrase),hits=[...expected].filter(w=>tokens.has(w)).length;const score=normalized.includes(norm(phrase))?1:hits/expected.size;if(hits>=3&&score>=.78)best=Math.max(best,score);}if(best)result.push({reference,reason:'Possible phrase match',score:best});}const unique=new Map();for(const candidate of result.sort((a,b)=>b.score-a.score))if(!unique.has(candidate.reference))unique.set(candidate.reference,candidate);return [...unique.values()].slice(0,3);}
 root.SermonEngine={match,references,coverage:phrases.length};
})(typeof window==='undefined'?globalThis:window);
