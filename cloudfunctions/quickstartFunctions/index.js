const getOpenId = require('./getOpenId/index');
const getMiniProgramCode = require('./getMiniProgramCode/index');
const createApplication = require('./createApplication/index');
const selectApplicationByOpenid = require('./selectApplicationByOpenid/index');
const updateApplication = require('./updateApplication/index');
const deleteApplication = require('./deleteApplication/index');


// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'getOpenId':
      return await getOpenId.main(event, context);
    case 'getMiniProgramCode':
      return await getMiniProgramCode.main(event, context);
    case 'createApplication':
      return await createApplication.main(event, context);
    case 'selectApplicationByOpenid':
      return await selectApplicationByOpenid.main(event, context);
    case 'updateApplication':
      return await updateApplication.main(event, context);
    case 'deleteApplication':
      return await deleteApplication.main(event, context);
    case 'selectApplicationById':
      return await selectApplicationById.main(event, context);
  }
};