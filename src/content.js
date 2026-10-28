// Editorial draft: homepage access is blocked by the environment proxy.
// Do not mark source facts verified or add contacts/case photos without evidence.
export const company={
 name:'Kilang Repair Sofa',
 source:'https://kilangrepairsofa.com/',
 nameBasis:'Working display name derived from the user-supplied domain; official styling pending source verification.',
 sourceVerified:false,
};
// These are enquiry topics, not a claim that every repair is offered or feasible.
export const topics=[
 {id:'fabric',cat:'外观与面料',en:'The surface.',title:'记录看得见的磨损。',intro:'面料破损、表面磨损或局部开裂？把位置、范围和整体状态拍清楚，让咨询从实际情况开始。',check:['一张沙发整体照片','损坏部位的清晰近照','想保留的颜色或使用习惯'],question:'哪些部位需要查看？原有面料或颜色是否希望保留？'},
 {id:'comfort',cat:'坐感与支撑',en:'The comfort.',title:'说说坐下来的感觉。',intro:'坐感变软、局部下陷或支撑不均？告诉我们哪个座位、怎样使用时会出现问题。',check:['正面与侧面的整体照片','坐垫下陷或变形的位置','问题出现的时间与使用情况'],question:'问题集中在哪个座位？坐下或起身时有什么变化？'},
 {id:'structure',cat:'结构与异响',en:'The structure.',title:'把细节，一起看清楚。',intro:'如果有松动、倾斜或异响，先说明发生的部位和情境。具体能否处理，需要结合家具实际情况确认。',check:['整体结构和可见连接处','松动或异常部位的近照','异响出现的动作与位置'],question:'哪个动作会出现异常？是否有可见的松动或损坏？'}
];
export const caseArchive={status:'awaiting-source-access',cases:[]};
