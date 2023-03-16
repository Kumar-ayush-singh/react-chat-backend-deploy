
function consoleError(error){
    console.log(`ERROR MESSAGE >>>> ${error.message}`);
    
    if(error.errors){
        console.log(`ALL ERRORS MESSAGE >>>> `);
        Object.keys(error.errors).map( (key, i) => {
            console.log(`${i+1}.) ${error.errors[key].message}.`);
        })
    }

}

module.exports = consoleError;