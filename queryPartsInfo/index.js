// 云函数入口文件
const cloud = require('wx-server-sdk')

// 与小程序端一致，均需调用 init 方法初始化
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 可在入口函数外缓存 db 对象
const db = cloud.database();
const _ = db.command;

let _id = '';
let _openid = '';

// 查询角色拥有的所有装备相关道具
queryPartsForEquipment = async() => {
  const res = await db.collection('parts')
                      .doc(_id)
                      .field({
                        equipment: true,
                      })
                      .get();

  return res.data.equipment;
}

//////////////////////////////////////////////////
// queryPartsInfo
// 查询角色的附属数据信息
// param 
// openid: String       openid 如果传值则查询对应id的角色信息、如果不传值则查询自身的角色信息
// type: String         'equip' - 背包
// return
// result: Boolean      接口成功标识
// partsInfo: Array     [{id:'', total:5}] 物品ID 物品数量
//////////////////////////////////////////////////
// 云函数入口函数
exports.main = async (event, context) => {
  _openid = event.openid !== undefined ? event.openid : cloud.getWXContext().OPENID;
  _id = `parts-${_openid}`;
  const type = event.type;

  let result = true;
  let partsInfo = [];

  // 查询指定信息
  try {
    switch (type) {
      case 'equip':
        partsInfo = await queryPartsForEquipment();
        break;
      default:
        break;
    }
  } catch (e) {
    result = false;
    console.log('查询指定信息 err.', e);
  }

  return {
    result,
    partsInfo
  }
}