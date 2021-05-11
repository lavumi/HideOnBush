tt.Princess =  class PRCN_Spine extends tt.Node{
    _isVisible = true;


    shader;
    normalShader;
    silhouetteShader;



    batcher;
    mvp = new spine.webgl.Matrix4();

    skeletonRenderer;
    debugRenderer;
    debugShader;


    shapes;
    mySkeleton = {};
    activeSkeleton = "";
    movement = 1;


    animationQueue = [];
    _additionAnimations = ['DEAR', 'NO_WEAPON', 'POSING', 'RACE', 'RUN_JUMP', 'SMILE'];
    loading = false;
    loadingSkeleton;
    generalBattleSkeletonData = {}; //todo 이건 프로토 타입으로 빼도 될듯   
    generalAdditionAnimations = {};
    currentTexture;
    currentClassAnimData = {
        type: 0,
        data: {}
    };
    currentCharaAnimData = {
        id: 0,
        data: {}
    };
    currentClass = '1';

    loadingFinishCallback = null;

    silhouette = false;


    _getClass(i) {
        return (i < 10 ? '0' : '') + i;
    }


    _sliceCyspAnimation(buf) {
        var view = new DataView(buf), count = view.getInt32(12, true);
        return {
            count: count,
            data: buf.slice((count + 1) * 32)
        };
    }

    initialize() {
        let self = this;
        self.normalShader = spine.webgl.Shader.newTwoColoredTextured(gl);
        self.silhouetteShader = spine.webgl.Shader.newSilhouetteTextured(gl);
        self.shader = self.normalShader;
        self.batcher = new spine.webgl.PolygonBatcher(gl);
        self.mvp.ortho2d(0, 0, canvas.width - 1, canvas.height - 1);
        self.skeletonRenderer = new spine.webgl.SkeletonRenderer(gl);
        self.debugRenderer = new spine.webgl.SkeletonDebugRenderer(gl);
        self.debugRenderer.drawRegionAttachments = true;
        self.debugRenderer.drawBoundingBoxes = true;
        self.debugRenderer.drawMeshHull = true;
        self.debugRenderer.drawMeshTriangles = true;
        self.debugRenderer.drawPaths = true;
        self.debugShader = spine.webgl.Shader.newColored(gl);
        self.shapes = new spine.webgl.ShapeRenderer(gl);
    };


    _loadData(url, cb, loadType, progress) {
        // console.log(url);
        var xhr = new XMLHttpRequest;
        xhr.open('GET', url, true);
        if (loadType) xhr.responseType = loadType;
        if (progress) xhr.onprogress = progress;
        xhr.onload = function () {
            if (xhr.status == 200)
                cb(true, xhr.response);
            else
                cb(false);
        }
        xhr.onerror = function () {
            cb(false);
        }
        xhr.send();
    }
    loadCharacter(unit_id, class_id, finishCallback ) {
        let self = this;
        self.loadingFinishCallback = finishCallback;
        if (self.loading) return;
        self.loading = true;
        if (self.activeSkeleton == unit_id && self.currentClass == classList.value) return;
        self.currentClass = class_id;
        var baseUnitId = unit_id | 0;
        baseUnitId -= baseUnitId % 100 - 1;
        self.loadingSkeleton = { id: unit_id | 0, baseId: '000000' };
        var baseId = self.loadingSkeleton.baseId;

        if (!self.generalBattleSkeletonData[baseId])
            self._loadData('Resources/prcn/' + baseId + '_CHARA_BASE.cysp', function (success, data) {
                if (!success || data === null) return self.loading = false;
                self.generalBattleSkeletonData[baseId] = data;
                self._loadAdditionAnimation();
            }, 'arraybuffer');
        else 
            self._loadAdditionAnimation();
    }
    _loadAdditionAnimation() {
        let self = this;
        var doneCount = 0, abort = false;
        var baseId = self.loadingSkeleton.baseId;
        self.generalAdditionAnimations[baseId] = self.generalAdditionAnimations[baseId] || {};
        self._additionAnimations.forEach(function (i) {
            if (self.generalAdditionAnimations[baseId][i]) 
                return doneCount++;
            self._loadData('Resources/prcn/' + baseId + '_' + i + '.cysp', function (success, data) {
                if (!success || data == null) return abort = true;

                if (abort) return;
                self.generalAdditionAnimations[baseId][i] = self._sliceCyspAnimation(data);
                if (++doneCount == self._additionAnimations.length) 
                    self._loadClassAnimation();
            }, 'arraybuffer');
        });
        if (doneCount == self._additionAnimations.length) 
            return self._loadClassAnimation();
    }
    _loadClassAnimation() {
        let self = this;
        if (self.currentClassAnimData.type == self.currentClass)
            self._loadCharaSkillAnimation();
        else
            self._loadData('Resources/prcn/' + self._getClass(self.currentClass) + '_COMMON_BATTLE.cysp', function (success, data) {
                if (!success || data === null) return loading = false;
                self.currentClassAnimData = {
                    type: self.currentClass,
                    data: self._sliceCyspAnimation(data)
                }
                self._loadCharaSkillAnimation();
            }, 'arraybuffer');
    }
    _loadCharaSkillAnimation() {
        let self = this;
        var baseUnitId = self.loadingSkeleton.id;
        baseUnitId -= baseUnitId % 100 - 1;
        if (self.currentCharaAnimData.id == baseUnitId)
            self._loadTexture();
        else
        self._loadData('Resources/prcn/' + baseUnitId + '_BATTLE.cysp', function (success, data) {
                if (!success || data === null) return self.loading = false;
                self.currentCharaAnimData = {
                    id: baseUnitId,
                    data: self._sliceCyspAnimation(data)
                }
                self._loadTexture();
            }, 'arraybuffer');
    }
    _loadTexture() {
        let self = this;
        self._loadData('Resources/prcn/' + self.loadingSkeleton.id + '.atlas', function (success, atlasText) {
            if (!success) return self.loading = false;//
            self._loadData('Resources/prcn/' + self.loadingSkeleton.id + '.png', function (success, blob) {
                if (!success) return self.loading = false;
                var img = new Image();
                img.onload = function () {
                    var created = !!self.mySkeleton.skeleton;
                    if (created) {
                        self.mySkeleton.state.clearTracks();
                        self.mySkeleton.state.clearListeners();
                        gl.deleteTexture(self.currentTexture.texture)
                    }

                    var imgTexture = new spine.webgl.GLTexture(gl, img);
                    URL.revokeObjectURL(img.src);
                    let atlas = new spine.TextureAtlas(atlasText, function (path) {
                        return imgTexture;
                    });
                    self.currentTexture = imgTexture;
                    let atlasLoader = new spine.AtlasAttachmentLoader(atlas);

                    var baseId = self.loadingSkeleton.baseId;
                    var additionAnimations = Object.values(self.generalAdditionAnimations[baseId]);

                    var animationCount = 0;
                    var classAnimCount = self.currentClassAnimData.data.count;
                    animationCount += classAnimCount;
                    var unitAnimCount = self.currentCharaAnimData.data.count;
                    animationCount += unitAnimCount;
                    additionAnimations.forEach(function (i) {
                        animationCount += i.count;
                    })

                    //assume always no more than 128 animations
                    var newBuffSize = self.generalBattleSkeletonData[baseId].byteLength - 64 + 1 +
                        self.currentClassAnimData.data.data.byteLength +
                        self.currentCharaAnimData.data.data.byteLength;
                    additionAnimations.forEach(function (i) {
                        newBuffSize += i.data.byteLength;
                    })
                    var newBuff = new Uint8Array(newBuffSize);
                    var offset = 0;
                    newBuff.set(new Uint8Array(self.generalBattleSkeletonData[baseId].slice(64)), 0);
                    offset += self.generalBattleSkeletonData[baseId].byteLength - 64;
                    newBuff[offset] = animationCount;
                    offset++;
                    newBuff.set(new Uint8Array(self.currentClassAnimData.data.data), offset);
                    offset += self.currentClassAnimData.data.data.byteLength;
                    newBuff.set(new Uint8Array(self.currentCharaAnimData.data.data), offset);
                    offset += self.currentCharaAnimData.data.data.byteLength;
                    additionAnimations.forEach(function (i) {
                        newBuff.set(new Uint8Array(i.data), offset);
                        offset += i.data.byteLength;
                    })

                    var skeletonBinary = new spine.SkeletonBinary(atlasLoader);
                    var skeletonData = skeletonBinary.readSkeletonData(newBuff.buffer);
                    var skeleton = new spine.Skeleton(skeletonData);
                    skeleton.setSkinByName('default');
                    var bounds = self._calculateBounds(skeleton);

                    let animationStateData = new spine.AnimationStateData(skeleton.data);
                    var animationState = new spine.AnimationState(animationStateData);
                    // console.log( animationStateData );
                    //animationState.setAnimation(0, getClass(currentClass) + '_idle', true);
                    animationState.addListener({
                        /*
                        start: function (track) {
                            //console.log("Animation on track " + track.animation.name + " started" + "     " + Date.now());
                        },
                        
                        interrupt: function (track) {
                            console.log("Animation on track " + track.trackIndex + " interrupted");
                        },
                        end: function (track) {
                            console.log("Animation on track " + track.trackIndex + " ended");
                        },
                        disposed: function (track) {
                            console.log("Animation on track " + track.trackIndex + " disposed");
                        },*/    
                        complete: function tick(track) {
                            //console.log("Animation on track " + track.animation.name + " ended" + "     " + Date.now());
                            if (self.animationQueue.length) {
                                var nextAnim = self.animationQueue.shift();
                                // console.log( 'start ' + nextAnim );
                                if (nextAnim == 'stop') return;
                                if (nextAnim == 'hold') return setTimeout(tick, 1e3);
                                nextAnim = setAnimName(nextAnim);
                                if( nextAnim === '02_run'){
                                    self.movement = 1;
                                }
                                animationState.setAnimation(0, nextAnim, !self.animationQueue.length);
                            }
                        },
                        /*event: function (track, event) {
                            console.log("Event on track " + track.trackIndex + ": " + JSON.stringify(event));
                        }*/
                    });

                    self.mySkeleton = { skeleton: skeleton, state: animationState, bounds: bounds, premultipliedAlpha: true }
                    self.loading = false;
                    //(window.updateUI || setupUI)();
                    if (!created) {
                        self.loadingFinishCallback && self.loadingFinishCallback();
                        self.loadingFinishCallback = null;
                    }
                    self.activeSkeleton = self.loadingSkeleton.id;
                }
                img.src = URL.createObjectURL(blob);
            }, 'blob', function (e) {
                var perc = e.loaded / e.total * 40 + 60;
            });
        })
    }
    _calculateBounds(skeleton) {
        skeleton.setToSetupPose();
        skeleton.updateWorldTransform();
        var offset = new spine.Vector2();
        var size = new spine.Vector2();
        skeleton.getBounds(offset, size, []);
        offset.y = 0
        return { offset: offset, size: size };
    }



    moveDelta = [];
    targetPosition = [];
    moveTime = 1;
    moveTo( time, posX , posY ){
        this.moveTime = time;
        this.targetPosition= [posX,posY];
        this.moveDelta = [posX - this.position[0] , posY - this.position[1]];
        this.run( posX - this.position[0] < 0);
    }

    _update( dt ){
        this.mySkeleton.state.update(dt);
        if ( this.targetPosition.length === 0 ) return;
        if ( Math.abs(this.position[0] - this.targetPosition[0] ) < 20 && Math.abs(this.position[1] - this.targetPosition[1]) < 20 ){
            this.position[0] = this.targetPosition[0];
            this.position[1] = this.targetPosition[1];
            this.targetPosition.length = 0;
            this.moveDelta.length = 0;
            this.setIdle();
        }
        else {
            this.position[0] += this.moveDelta[0] * dt / this.moveTime;
            this.position[1] += this.moveDelta[1] * dt / this.moveTime;
        }

    }

    _render( ){
        if ( this._isVisible === false ) return;

        // Apply the animation state based on the delta time.
        var state = this.mySkeleton.state;
        var skeleton = this.mySkeleton.skeleton;
        var premultipliedAlpha = this.mySkeleton.premultipliedAlpha;


        skeleton.x = this.position[0] * 2;
        skeleton.y = this.position[1] * 2;
        skeleton.flipX = this.movement<0;

        state.apply(skeleton);
        skeleton.updateWorldTransform();

        // Bind the shader and set the texture and model-view-projection matrix.
        this.shader.bind();
        this.shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
        this.shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, this.mvp.values);

        // Start the batch and tell the SkeletonRenderer to render the active skeleton.
        this.batcher.begin(this.shader);
        this.skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
        this.skeletonRenderer.draw(this.batcher, skeleton);
        this.batcher.end();

        this.shader.unbind();

        if (false) {
            this.debugShader.bind();
            this.debugShader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, mvp.values);
            this.debugRenderer.premultipliedAlpha = premultipliedAlpha;
            this.shapes.begin(debugShader);
            this.debugRenderer.draw(shapes, skeleton);
            this.shapes.end();
            this.debugShader.unbind();
        }
    }


    _runAnimation( animArray){

        let self = this;
        if( this.animationQueue.length !== 0)
            return false ;

        var firstActionObj =  animArray.shift();
        var firstAction = firstActionObj.animName;

        firstAction = this._setAnimName(firstAction);



        var AnimEntry = this.mySkeleton.state.setAnimation(0, firstAction, firstActionObj.isLoop);
        AnimEntry.timeScale = firstActionObj.timeScale;

        animArray.forEach( function(i){
            self.animationQueue.push( i.animName);
        })
        return true;
    }


    _setAnimName(animName) {
        var returnName;
        if (animName.substr(0, 6) == '000000') returnName = animName;
        else if (animName.substr(0, 1) != '1') returnName = this._getClass(this.currentClassAnimData.type) + '_' + animName;
        else returnName = animName;
        return returnName
    }
    swapShader(){
        if ( this.silhouette === false ){
            this.shader = this.silhouetteShader;
            this.silhouette = true;
        }
        else {
            this.shader = this.normalShader;
            this.silhouette = false;
        }
    }

    resize( scale ){

        var centerX = 0;
        var centerY = 0;
        var width = canvas.width / scale * 2 ;
        var height = canvas.height / scale * 2;

        this.mvp.ortho2d(centerX - width / 2, centerY - height / 2, width, height);
    }


    setIdle(){
        this.mySkeleton.state.setAnimation(0, this._getClass(this.currentClass) + '_idle', true);
    }

    setDearIdle( direction ){
        this.mySkeleton.state.setAnimation(0, '000000_dear_idol', true);
        this.movement = direction ? direction : 0.5;
    }

    run(isLeft ){
        if(isLeft === true)
            this.movement = -1;
        else
            this.movement = 1;

        var run = {
            animName : 'run',
            isLoop : true,
            timeScale : 1
        };
        this.mySkeleton.state.setAnimation(0, this._getClass(this.currentClass) + '_run', true);
       // runAnimation([run]);
    }

    die(){
        this.movement = 0;
        var stop = {
            animName : 'stop',
            isLoop : false,
            timeScale : 1
        };
        var die = {
            animName : 'die',
            isLoop : false,
            timeScale : 1
        };
        this.animationQueue.length = 0;
        this._runAnimation([die, stop]);
    }

    getRect(){
        let width = 180;
        let height = 230;
        return {
            x : this.position[0] - width/2,
            y : this.position[1] ,
            width : width,
            height : height
        }
    }

    setVisible( _visible ){
        this._isVisible = _visible;
    }
}