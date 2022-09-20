import { FiniteStateMachine , State } from './FiniteStateMachine.js';

const PI_2 = Math.PI / 2;
const PI_3 = Math.PI / 3;
const PI_4 = Math.PI / 4;
const PI_6 = Math.PI / 6;
const PI_12 = Math.PI / 12;
const PI_13 = Math.PI / 13;

const arm_angle = PI_6;

export class MonsterFSM extends FiniteStateMachine {
    constructor(target) {
        super(target);

        this._targetDict = {
            Upper_leg_sx: { name: "LeftUpLeg_055", mesh: null, initValue: null },
            Lower_leg_sx: { name: "LeftLeg_056", mesh: null, initValue: null },
            Foot_sx: { name: "LeftFoot_057", mesh: null, initValue: null },
            Upper_leg_dx: { name: "RightUpLeg_060", mesh: null, initValue: null },
            Lower_leg_dx: { name: "RightLeg_061", mesh: null, initValue: null },
            Foot_dx: { name: "RightFoot_062", mesh: null, initValue: null },

            Hips: { name: "Hips_01", mesh: null, initValue: null },
            Neck: { name: "Neck_05", mesh: null, initValue: null },
            Head: { name: "Head_06", mesh: null, initValue: null },
            

            Shoulder_sx: { name: "LeftShoulder_08", mesh: null, initValue: null}, //{ x:0, y:-PI_3, z:0 }
            Upper_arm_sx: { name: "LeftArm_09", mesh: null, initValue: { x:PI_3, y:0, z:0 } },
            Lower_arm_sx: { name: "LeftForeArm_010", mesh: null, initValue:  null},
            /*Hand_sx: { name: "LeftHand_011", mesh: null, initValue: null },
            Thumb_sx: { name: "LeftHandThumb1_012", mesh: null, initValue: null },
            Index_sx: { name: "LeftHandIndex1_016", mesh: null, initValue: null },
            Middle_sx: { name: "LeftHandMiddle1_020", mesh: null, initValue: null },
            Ring_sx: { name: "LeftHandRing1_024", mesh: null, initValue: null },
            Pinky_sx: { name: "LeftHandPinky1_028", mesh: null, initValue: null },*/

            Shoulder_dx: { name: "RightShoulder_032", mesh: null, initValue: null }, //{ x:0, y:PI_3, z:0 }
            Upper_arm_dx: { name: "RightArm_033", mesh: null, initValue:  { x:PI_3, y:0, z:0 } },
            Lower_arm_dx: { name: "RightForeArm_034", mesh: null, initValue:null   },
            /*Hand_dx: { name: "RightHand_035", mesh: null, initValue: null },
            Thumb_dx: { name: "RightHandThumb1_036", mesh: null, initValue: null },
            Index_dx: { name: "RightHandIndex1_040", mesh: null, initValue: null },
            Middle_dx: { name: "RightHandMiddle1_044", mesh: null, initValue: null },
            Ring_dx: { name: "RightHandRing1_048", mesh: null, initValue: null },
            Pinky_dx: { name: "RightHandPinky1_052", mesh: null, initValue: null },*/
        };
        this._prepareDict();

        this._AddState('idle', IdleState);
        this._AddState('walk', WalkState);
    }
};

var vel = 0.01;

class IdleState extends State {
    constructor(parent) {
      super(parent);
      this._learping = false;
      this._lerpTotSteps = 10;
      this._lerpStepVal = 1 / this._lerpTotSteps;
      
      this._stateSlap = 0;
      this._upper_arm_dx = this._targetDict.Upper_arm_dx.initValue.x;
      this._shoulder_dx_x = this._targetDict.Shoulder_dx.initValue.x;
      this._shoulder_dx_z = this._targetDict.Shoulder_dx.initValue.z;
    }
  
    get Name() {
      return 'idle';
    }
    Enter(prevState) {
      this._lerpStep = this._lerpStepVal;
      this._learping = true;
    }
    Update(input) {
      if (input._keys.forward || input._keys.backward) {
        this._parent.SetState('walk');
      }
      if(input._keys.enter){
        while(this._stateSlap < 3){
          switch (this._stateSlap) {
            case 0:
                if (this._targetDict.Upper_arm_dx.mesh.rotation.y  <= this._upper_arm_dx-Math.PI/6) {
                    this._stateSlap+=1;
                } else {
                    this._targetDict.Upper_arm_dx.mesh.rotation.y -= vel;
                }
                break;
            case 1:
                if (this._targetDict.Shoulder_dx.mesh.rotation.z >= this._shoulder_dx_z + Math.PI/3) {
                    this._stateSlap+=1;
                } else {
                    this._targetDict.Shoulder_dx.mesh.rotation.z += vel;
                }
                break;
            case 2:
                if (this._targetDict.Shoulder_dx.mesh.rotation.x >= this._shoulder_dx_x + Math.PI/2) {
                    this._stateSlap+=1;
                } else {
                    this._targetDict.Shoulder_dx.mesh.rotation.x += vel;
                }   
                break;
          }
        }
        this._lerpStep = this._lerpStepVal;
        this._learping = true;
      }   
      if (this._learping){
        if(this._lerpStep <= 1){
            for(var i in this._targetDict){
                this._targetDict[i].mesh.rotation.set( ...this.lerp(this._targetDict[i].mesh.rotation, this._targetDict[i].initValue, this._lerpStep));
            }

            this._lerpStep += this._lerpStepVal;

            return;
        } 
        else {
            this._learping = false;
        }
      }          
    }
};


class WalkState extends State {
  constructor(params) {
      super(params);
      this._stateLegs = 0;
      this._stateArms = 0;
      this._stateNeck = 0;
      this._stateHips = 0;
      this._upper_leg_sx = this._targetDict.Upper_leg_sx.initValue.x;
      this._upper_leg_dx = this._targetDict.Upper_leg_dx.initValue.x;
      this._lower_leg_sx = this._targetDict.Lower_leg_sx.initValue.x;
      this._lower_leg_dx = this._targetDict.Lower_leg_dx.initValue.x;
      this._foot_sx = this._targetDict.Foot_sx.initValue.z;
      this._foot_dx = this._targetDict.Foot_dx.initValue.z;

      this._shoulder_sx = this._targetDict.Shoulder_sx.initValue.x;
      this._shoulder_dx = this._targetDict.Shoulder_dx.initValue.x;
      this._lower_arm_sx = this._targetDict.Lower_arm_sx.initValue.z;
      this._lower_arm_dx = this._targetDict.Lower_arm_dx.initValue.z;

      this._neck = this._targetDict.Neck.initValue.y;

      this._hips = this._targetDict.Hips.initValue.y;
  }

  Update(input) {
    if (input._keys.forward || input._keys.backward || input._keys.left || input._keys.right || input._keys.space) {
      if(this._stateLegs==0) {
        if (this._targetDict.Upper_leg_sx.mesh.rotation.x >= this._upper_leg_sx + PI_12) {
            this._stateLegs = 1;
        } else {
            this._targetDict.Upper_leg_sx.mesh.rotation.x += vel;
            if (this._targetDict.Lower_leg_sx.mesh.rotation.x <= this._lower_leg_sx) {
                this._targetDict.Lower_leg_sx.mesh.rotation.x += vel;
            }
            if (this._targetDict.Foot_sx.mesh.rotation.z <= this._foot_sx) {
              this._targetDict.Foot_sx.mesh.rotation.z += vel;
            }
            this._targetDict.Upper_leg_dx.mesh.rotation.x -= vel;
            if (this._targetDict.Lower_leg_dx.mesh.rotation.x >= this._lower_leg_dx-PI_12) {
                this._targetDict.Lower_leg_dx.mesh.rotation.x -= vel;
            }
            if (this._targetDict.Foot_dx.mesh.rotation.z >= this._foot_dx-PI_12) {
              this._targetDict.Foot_dx.mesh.rotation.z -= vel;
            }
        }
      }
      else if(this._stateLegs==1){
        if (this._targetDict.Upper_leg_sx.mesh.rotation.x <= this._upper_leg_sx-PI_12) {
            this._stateLegs = 0;
        } 
        else {
            this._targetDict.Upper_leg_sx.mesh.rotation.x -= vel;
            if (this._targetDict.Lower_leg_sx.mesh.rotation.x >= this._lower_leg_sx-PI_12) {
                this._targetDict.Lower_leg_sx.mesh.rotation.x -= vel;
            }
            if (this._targetDict.Foot_sx.mesh.rotation.z >= this._foot_sx-PI_12) {
              this._targetDict.Foot_sx.mesh.rotation.z -= vel;
            }
            this._targetDict.Upper_leg_dx.mesh.rotation.x += vel;
            if (this._targetDict.Lower_leg_dx.mesh.rotation.x <= this._lower_leg_dx) {
                this._targetDict.Lower_leg_dx.mesh.rotation.x += vel;
            }
            if (this._targetDict.Foot_dx.mesh.rotation.z <= this._foot_dx) {
              this._targetDict.Foot_dx.mesh.rotation.z += vel;
            }
        }
      }

      if(this._stateArms==0) {
        if (this._targetDict.Shoulder_sx.mesh.rotation.x >= this._shoulder_sx+PI_12) {
            this._stateArms = 1;
        } 
        else {
          this._targetDict.Shoulder_sx.mesh.rotation.x += vel;
          if (this._targetDict.Lower_arm_sx.mesh.rotation.z <= this._lower_arm_sx) {
            this._targetDict.Lower_arm_sx.mesh.rotation.z += vel;
          }

          this._targetDict.Shoulder_dx.mesh.rotation.x -= vel;
          if (this._targetDict.Lower_arm_dx.mesh.rotation.z >= this._lower_arm_dx-PI_12) {
            this._targetDict.Lower_arm_dx.mesh.rotation.z -= vel;
          }          
        }
      }
      else if(this._stateArms==1){
        if (this._targetDict.Shoulder_sx.mesh.rotation.x <= this._shoulder_sx-PI_12) {
            this._stateArms = 0;
        } 
        else {
            this._targetDict.Shoulder_sx.mesh.rotation.x -= vel;
            if (this._targetDict.Lower_arm_sx.mesh.rotation.z >= this._lower_arm_sx-PI_12) {
              this._targetDict.Lower_arm_sx.mesh.rotation.z -= vel;
            }
            this._targetDict.Shoulder_dx.mesh.rotation.x += vel;
            if (this._targetDict.Lower_arm_dx.mesh.rotation.z <= this._lower_arm_dx) {
              this._targetDict.Lower_arm_dx.mesh.rotation.z += vel;
            }
        }
      }  
      
      if(this._stateNeck==0) {
        if (this._targetDict.Neck.mesh.rotation.y >= this._neck+PI_13) {
            this._stateNeck = 1;
        } 
        else {
          this._targetDict.Neck.mesh.rotation.y += vel;
        }
      }
      else if(this._stateNeck==1){
        if (this._targetDict.Neck.mesh.rotation.y <= this._neck-PI_13) {
            this._stateNeck = 0;
        } 
        else {
            this._targetDict.Neck.mesh.rotation.y -= vel;
        }
      }        
      
      if(this._stateHips==0) {
        if (this._targetDict.Hips.mesh.rotation.y >= this._hips+PI_13) {
            this._stateHips = 1;
        } 
        else {
          this._targetDict.Hips.mesh.rotation.y += vel;
        }
      }
      else if(this._stateHips==1){
        if (this._targetDict.Hips.mesh.rotation.y <= this._hips-PI_13) {
            this._stateHips = 0;
        } 
        else {
            this._targetDict.Hips.mesh.rotation.y -= vel;
        }
      }              
    } 
    else {
      this._parent.SetState('idle');
      return;
    }
  }
}