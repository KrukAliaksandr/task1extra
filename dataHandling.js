const { Organization, PersonalRecord, BuisnessRecord } = require('./recordTypes');
const fs = require('fs');

const transformIntoListOfRecords = (consoleArgument) => {
  const recordsArray = [];
  consoleArgument.forEach((record) => {
    const dataArray = record.split('-');
    const [name, phone, description] = dataArray;
    const buisnessRecord = { name, phone, description };
    recordsArray.push(buisnessRecord);
  });
  return recordsArray;
};

const createRecord = (args) => {
  if ('list' in args) {
    return new Organization(args.title, transformIntoListOfRecords(args.list));
  } else {
    if ('description' in args) {
      return new BuisnessRecord(args.title, args.phone, args.description);
    } else return new PersonalRecord(args.title, args.phone);
  }
};

const writeRecordToFile = (args, requiredFile) => {
  requiredFile.push(createRecord(args));
  fs.writeFileSync(args.file + '.json', JSON.stringify(requiredFile, null, '\t'), 'utf8', () => {
  });
};

const listRecords = (args, requiredFile) => {
  requiredFile.forEach((node) => {
    console.log(node);
  });
};

// if 'exclude matches' key is set, found records will be excluded from results
const filterRecords = (searchFiltersObject, jsonArray, filterParameter = 'includeMatches') => {
  const resultsArray = jsonArray.filter(record => {
    let recordComparsionResult = true;
    for (let parameter in record) {
      switch (parameter) {
        case 'name':
          if ((record.name !== searchFiltersObject.name)) recordComparsionResult = false;
          break;
        case 'phone':
          if ((record.phone !== searchFiltersObject.phone)) recordComparsionResult = false;
          break;
        case 'description':
          if ((record.description !== searchFiltersObject.description)) recordComparsionResult = false;
          break;
        case 'empList':
          // search for substring in character name. Approve only if the substring is situated at the start.
          let recordNumberInList = 0;
          while (recordNumberInList < record.empList.length) {
            if (searchFiltersObject.empList[recordNumberInList].name !== record.empList[recordNumberInList].name ||
                searchFiltersObject.empList[recordNumberInList].phone !== record.empList[recordNumberInList].phone ||
                searchFiltersObject.empList[recordNumberInList].description !== record.empList[recordNumberInList].description) {
              recordComparsionResult = false;
              break;
            }
            recordNumberInList++;
          }
          break;
        default:
          if (record[parameter] !== searchFiltersObject[parameter]) {
            recordComparsionResult = false;
          }
          break;
      }
    }
    // if 'exclude matches' key is set, matching records will be deleted to perform removeRecordsFromFile func
    return (filterParameter === 'excludeMatches') ? (!recordComparsionResult) : (recordComparsionResult);
  });
  return resultsArray;
};

const removeRecordsFromFile = (args, requiredFile) => {
  const results = filterRecords(createRecord(args), requiredFile, 'excludeMatches');
  fs.writeFileSync(args.file + '.json', JSON.stringify(results, null, '\t'), 'utf8', () => {
  });
};

const findRecordsInFile = (args, requiredFile) => {
  const results = filterRecords(createRecord(args), requiredFile);
  console.log(JSON.stringify(results, null, '\t'));
};

module.exports = {
  createRecord,
  transformIntoListOfRecords,
  filterRecords,
  writeRecordToFile,
  removeRecordsFromFile,
  findRecordsInFile,
  listRecords
};
