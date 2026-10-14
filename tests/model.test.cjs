const {test}=require('node:test');const assert=require('node:assert/strict');const {lyricSlides,validateBible,searchBible}=require('../web/model');
const bible={translation:'Test fixture',verses:[{book:'John',chapter:3,verse:16,text:'Fixture alpha'},{book:'John',chapter:3,verse:17,text:'Fixture beta'},{book:'1 John',chapter:3,verse:16,text:'Fixture gamma'}]};
test('lyrics split on blank lines and cap at four lines',()=>assert.deepEqual(lyricSlides('a\nb\nc\nd\ne\n\nf'),['a\nb\nc\nd','e','f']));
test('exact reference and range do not confuse numbered books',()=>{assert.equal(searchBible(bible,'John 3:16-17').length,2);assert.equal(searchBible(bible,'1 John 3:16')[0].text,'Fixture gamma');});
test('chapter and keyword search',()=>{assert.equal(searchBible(bible,'John 3').length,2);assert.equal(searchBible(bible,'BETA')[0].verse,17);assert.deepEqual(searchBible(bible,''),[]);});
test('Bible importer rejects malformed and duplicate verses',()=>{assert.equal(validateBible(bible),bible);assert.throws(()=>validateBible({translation:'X',verses:[{}]}));assert.throws(()=>validateBible({...bible,verses:[bible.verses[0],bible.verses[0]]}));});
