/* Reciblage Mixamo -> squelette Character Creator (sorcière) : delta d'orientation + correction de direction des membres */
const RT_MAP = {Hips:'Hip', Spine:'Waist', Spine1:'Spine01', Spine2:'Spine02', Neck:'NeckTwist01', Head:'Head',
  LeftShoulder:'L_Clavicle', LeftArm:'L_Upperarm', LeftForeArm:'L_Forearm', LeftHand:'L_Hand', RightShoulder:'R_Clavicle', RightArm:'R_Upperarm', RightForeArm:'R_Forearm', RightHand:'R_Hand',
  LeftUpLeg:'L_Thigh', LeftLeg:'L_Calf', LeftFoot:'L_Foot', RightUpLeg:'R_Thigh', RightLeg:'R_Calf', RightFoot:'R_Foot'};
const RT_DIR = {LeftShoulder:'LeftArm', LeftArm:'LeftForeArm', LeftForeArm:'LeftHand', RightShoulder:'RightArm', RightArm:'RightForeArm', RightForeArm:'RightHand', LeftUpLeg:'LeftLeg', LeftLeg:'LeftFoot', RightUpLeg:'RightLeg', RightLeg:'RightFoot'};
const RT_ORDER = ['Hips','Spine','Spine1','Spine2','Neck','Head','LeftShoulder','LeftArm','LeftForeArm','LeftHand','RightShoulder','RightArm','RightForeArm','RightHand','LeftUpLeg','LeftLeg','LeftFoot','RightUpLeg','RightLeg','RightFoot'];
function makeRetarget(srcRoot, tgtRoot){
  const S = {}, T = {}; srcRoot.traverse(o => { if (!o.isBone) return; const m = o.name.match(/mixamorig:?(\w+)$/); if (m) S[m[1]] = o; });
  tgtRoot.traverse(o => { if (!o.isBone) return; for (const k in RT_MAP) if (new RegExp('^CC_Base_' + RT_MAP[k] + '(_\\d+)?$').test(o.name)) T[k] = o; });
  srcRoot.updateMatrixWorld(true); tgtRoot.updateMatrixWorld(true);
  const q = o => o.getWorldQuaternion(new THREE.Quaternion()), p = o => o.getWorldPosition(new THREE.Vector3());
  const rest = {}; RT_ORDER.forEach(k => { if (S[k] && T[k]) rest[k] = {s:q(S[k]), t:q(T[k])}; });
  const hs0 = p(S.Hips).clone(), ht0 = T.Hips.position.clone(), ratio = p(T.Hips).y / Math.max(1e-4, p(S.Hips).y - (srcRoot.getWorldPosition(new THREE.Vector3()).y));
  const tmp = new THREE.Quaternion(), pq = new THREE.Quaternion();
  return function apply(){
    srcRoot.updateMatrixWorld(true);
    for (const k of RT_ORDER) { const s = S[k], t = T[k]; if (!s || !t || !rest[k]) continue;
      const qs = q(s); let w = qs.clone().multiply(rest[k].s.clone().invert()).multiply(rest[k].t);
      t.parent.updateMatrixWorld(true);
      if (RT_DIR[k] && S[RT_DIR[k]] && T[RT_DIR[k]]) { /* aligner la direction du membre */
        const ds = p(S[RT_DIR[k]]).sub(p(s)).normalize(); const lc = T[RT_DIR[k]].position.clone().normalize();
        const dt = lc.clone().applyQuaternion(w).normalize(); w = new THREE.Quaternion().setFromUnitVectors(dt, ds).multiply(w); }
      t.parent.getWorldQuaternion(pq); t.quaternion.copy(pq.invert().multiply(w)); t.updateMatrixWorld(true); }
    const d = p(S.Hips).sub(hs0); T.Hips.position.copy(ht0); T.Hips.parent.updateMatrixWorld(true);
    const wp = p(T.Hips).add(new THREE.Vector3(0, d.y*ratio*.9, 0)); T.Hips.position.copy(T.Hips.parent.worldToLocal(wp));
  };
}
