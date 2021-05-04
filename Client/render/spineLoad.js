var Spine = function () {

    var shader;
    var batcher;
    var mvp = new spine.webgl.Matrix4();
    var skeletonRenderer;
    var debugRenderer;
    var debugShader;
    var shapes;
    var mySkeleton = {};
    var activeSkeleton = "";

    var movement = 1;


    //spineData
    var animationQueue = [];



    var additionAnimations = ['DEAR', 'NO_WEAPON', 'POSING', 'RACE', 'RUN_JUMP', 'SMILE'];

    var loading = false;
    var loadingSkeleton;
    var generalBattleSkeletonData = {};
    var generalAdditionAnimations = {};
    var currentTexture;
    var currentClassAnimData = {
        type: 0,
        data: {}
    };
    var currentCharaAnimData = {
        id: 0,
        data: {}
    };
    var currentClass = '1';




    var loadingFinishCallback = null;

    function getClass(i) {
        return (i < 10 ? '0' : '') + i;
    }


    function sliceCyspAnimation(buf) {
        var view = new DataView(buf), count = view.getInt32(12, true);
        return {
            count: count,
            data: buf.slice((count + 1) * 32)
        };
    }

    function initSpineGL() {
        shader = spine.webgl.Shader.newTwoColoredTextured(gl);
        batcher = new spine.webgl.PolygonBatcher(gl);
        mvp.ortho2d(0, 0, canvas.width - 1, canvas.height - 1);
        skeletonRenderer = new spine.webgl.SkeletonRenderer(gl);
        debugRenderer = new spine.webgl.SkeletonDebugRenderer(gl);
        debugRenderer.drawRegionAttachments = true;
        debugRenderer.drawBoundingBoxes = true;
        debugRenderer.drawMeshHull = true;
        debugRenderer.drawMeshTriangles = true;
        debugRenderer.drawPaths = true;
        debugShader = spine.webgl.Shader.newColored(gl);
        shapes = new spine.webgl.ShapeRenderer(gl);
    };


    function loadData(url, cb, loadType, progress) {
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



    function loadSpine(unit_id, class_id, finishCallback ) {
        loadingFinishCallback = finishCallback;
        if (loading) return;
        loading = true;
        if (activeSkeleton == unit_id && currentClass == classList.value) return;
        currentClass = class_id;
        var baseUnitId = unit_id | 0;
        baseUnitId -= baseUnitId % 100 - 1;
        loadingSkeleton = { id: unit_id | 0, baseId: '000000' };
        //	if (loadingSkeleton.info.hasSpecialBase) loadingSkeleton.baseId = baseUnitId, currentClass = baseUnitId;
        var baseId = loadingSkeleton.baseId;

        if (!generalBattleSkeletonData[baseId])
            loadData('prcn_data/' + baseId + '_CHARA_BASE.cysp', function (success, data) {
                if (!success || data === null) return loading = false;
                generalBattleSkeletonData[baseId] = data;
                loadAdditionAnimation();
            }, 'arraybuffer');
        else loadAdditionAnimation();
    }
    function loadAdditionAnimation() {
        var doneCount = 0, abort = false;
        var baseId = loadingSkeleton.baseId;
        generalAdditionAnimations[baseId] = generalAdditionAnimations[baseId] || {};
        additionAnimations.forEach(function (i) {
            if (generalAdditionAnimations[baseId][i]) return doneCount++;
            loadData('prcn_data/' + baseId + '_' + i + '.cysp', function (success, data) {
                if (!success || data == null) return abort = true;

                if (abort) return;
                generalAdditionAnimations[baseId][i] = sliceCyspAnimation(data);
                if (++doneCount == additionAnimations.length) loadClassAnimation();
            }, 'arraybuffer');
        });
        if (doneCount == additionAnimations.length) return loadClassAnimation();
    }
    function loadClassAnimation() {
        if (currentClassAnimData.type == currentClass)
            loadCharaSkillAnimation();
        else
            loadData('prcn_data/' + getClass(currentClass) + '_COMMON_BATTLE.cysp', function (success, data) {
                if (!success || data === null) return loading = false;
                currentClassAnimData = {
                    type: currentClass,
                    data: sliceCyspAnimation(data)
                }
                loadCharaSkillAnimation();
            }, 'arraybuffer');
    }
    function loadCharaSkillAnimation() {
        var baseUnitId = loadingSkeleton.id;
        baseUnitId -= baseUnitId % 100 - 1;
        if (currentCharaAnimData.id == baseUnitId)
            loadTexture();
        else
            loadData('prcn_data/' + baseUnitId + '_BATTLE.cysp', function (success, data) {
                if (!success || data === null) return loading = false;
                currentCharaAnimData = {
                    id: baseUnitId,
                    data: sliceCyspAnimation(data)
                }
                loadTexture();
            }, 'arraybuffer');
    }
    function loadTexture() {
        loadData('prcn_data/' + loadingSkeleton.id + '.atlas', function (success, atlasText) {
            if (!success) return loading = false;//
            loadData('prcn_data/' + loadingSkeleton.id + '.png', function (success, blob) {
                if (!success) return loading = false;
                var img = new Image();
                img.onload = function () {
                    var created = !!mySkeleton.skeleton;
                    if (created) {
                        mySkeleton.state.clearTracks();
                        mySkeleton.state.clearListeners();
                        gl.deleteTexture(currentTexture.texture)
                    }

                    var imgTexture = new spine.webgl.GLTexture(gl, img);
                    URL.revokeObjectURL(img.src);
                    atlas = new spine.TextureAtlas(atlasText, function (path) {
                        return imgTexture;
                    });
                    currentTexture = imgTexture;
                    atlasLoader = new spine.AtlasAttachmentLoader(atlas);

                    var baseId = loadingSkeleton.baseId;
                    var additionAnimations = Object.values(generalAdditionAnimations[baseId]);

                    var animationCount = 0;
                    var classAnimCount = currentClassAnimData.data.count;
                    animationCount += classAnimCount;
                    var unitAnimCount = currentCharaAnimData.data.count;
                    animationCount += unitAnimCount;
                    additionAnimations.forEach(function (i) {
                        animationCount += i.count;
                    })

                    //assume always no more than 128 animations
                    var newBuffSize = generalBattleSkeletonData[baseId].byteLength - 64 + 1 +
                        currentClassAnimData.data.data.byteLength +
                        currentCharaAnimData.data.data.byteLength;
                    additionAnimations.forEach(function (i) {
                        newBuffSize += i.data.byteLength;
                    })
                    var newBuff = new Uint8Array(newBuffSize);
                    var offset = 0;
                    newBuff.set(new Uint8Array(generalBattleSkeletonData[baseId].slice(64)), 0);
                    offset += generalBattleSkeletonData[baseId].byteLength - 64;
                    newBuff[offset] = animationCount;
                    offset++;
                    newBuff.set(new Uint8Array(currentClassAnimData.data.data), offset);
                    offset += currentClassAnimData.data.data.byteLength;
                    newBuff.set(new Uint8Array(currentCharaAnimData.data.data), offset);
                    offset += currentCharaAnimData.data.data.byteLength;
                    additionAnimations.forEach(function (i) {
                        newBuff.set(new Uint8Array(i.data), offset);
                        offset += i.data.byteLength;
                    })

                    var skeletonBinary = new spine.SkeletonBinary(atlasLoader);
                    var skeletonData = skeletonBinary.readSkeletonData(newBuff.buffer);
                    var skeleton = new spine.Skeleton(skeletonData);
                    skeleton.setSkinByName('default');
                    var bounds = calculateBounds(skeleton);

                    animationStateData = new spine.AnimationStateData(skeleton.data);
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
                            if (animationQueue.length) {
                                var nextAnim = animationQueue.shift();
                                // console.log( 'start ' + nextAnim );
                                if (nextAnim == 'stop') return;
                                if (nextAnim == 'hold') return setTimeout(tick, 1e3);
                                nextAnim = setAnimName(nextAnim);
                                if( nextAnim === '02_run'){
                                    movement = 1;
                                }
                                animationState.setAnimation(0, nextAnim, !animationQueue.length);
                            }
                        },
                        /*event: function (track, event) {
                            console.log("Event on track " + track.trackIndex + ": " + JSON.stringify(event));
                        }*/
                    });

                    mySkeleton = { skeleton: skeleton, state: animationState, bounds: bounds, premultipliedAlpha: true }
                    loading = false;
                    //(window.updateUI || setupUI)();
                    if (!created) {
                        canvas.style.width = '99%';
                        loadingFinishCallback && loadingFinishCallback();
                        loadingFinishCallback = null;
                        setTimeout(function () {
                            canvas.style.width = '';
                        }, 0)
                    }
                    activeSkeleton = loadingSkeleton.id;
                }
                img.src = URL.createObjectURL(blob);
            }, 'blob', function (e) {
                var perc = e.loaded / e.total * 40 + 60;
            });
        })
    }
    function calculateBounds(skeleton) {
        skeleton.setToSetupPose();
        skeleton.updateWorldTransform();
        var offset = new spine.Vector2();
        var size = new spine.Vector2();
        skeleton.getBounds(offset, size, []);
        offset.y = 0
        return { offset: offset, size: size };
    }
    function setAnimName(animName) {
        var returnName;
        if (animName.substr(0, 6) == '000000') returnName = animName;
        else if (animName.substr(0, 1) != '1') returnName = getClass(currentClassAnimData.type) + '_' + animName;
        else returnName = animName;
        return returnName
    }

    var charPosX = 0;
    var charPosY = 0;

    function spineRender(delta, showDebug) {
        mySkeleton.skeleton.x = charPosX;
        mySkeleton.skeleton.y = charPosY;
        // Apply the animation state based on the delta time.
        var state = mySkeleton.state;
        var skeleton = mySkeleton.skeleton;
        var premultipliedAlpha = mySkeleton.premultipliedAlpha;
        state.update(delta);
        state.apply(skeleton);
        setDirection( movement);
        skeleton.updateWorldTransform();

        // Bind the shader and set the texture and model-view-projection matrix.
        shader.bind();
        shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
        shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, mvp.values);

        // Start the batch and tell the SkeletonRenderer to render the active skeleton.
        batcher.begin(shader);
        skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
        skeletonRenderer.draw(batcher, skeleton);
        batcher.end();

        shader.unbind();

        if (showDebug) {
            debugShader.bind();
            debugShader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, mvp.values);
            debugRenderer.premultipliedAlpha = premultipliedAlpha;
            shapes.begin(debugShader);
            debugRenderer.draw(shapes, skeleton);
            shapes.end();
            debugShader.unbind();
        }
    }

    function setDirection( moveX) {
        if (moveX < 0) {
            mySkeleton.skeleton.flipX = true;
        }
        else if (moveX > 0) {
            mySkeleton.skeleton.flipX = false;
        }
    }

    function resize( scale ){

        var centerX = 0;
        var centerY = 0;
        var width = canvas.width / scale * 2 ;
        var height = canvas.height / scale * 2;

        mvp.ortho2d(centerX - width / 2, centerY - height / 2, width, height);
    }




    //에니메이션 실행 부분


    function setIdle(){
        mySkeleton.state.setAnimation(0, getClass(currentClass) + '_idle', true);
    }

    function setDearIdle( direction ){
        mySkeleton.state.setAnimation(0, '000000_dear_idol', true);
        movement = direction ? direction : 0.5;
    }

    function runChar(isLeft ){
        if(isLeft === true)
            movement = -1;
        else
            movement = 1;

        var run = {
            animName : 'run',
            isLoop : true,
            timeScale : 1
        };
        mySkeleton.state.setAnimation(0, getClass(currentClass) + '_run', true);
       // runAnimation([run]);
    }
    function stopChar(){
        movement = 0;
    
        var idle = {
            animName : 'idle',
            isLoop : true,
            timeScale : 1
        };
        runAnimation([idle]);
    }
    
    function attackChar (){
        movement = 0;
    
        var idle = {
            animName : 'idle',
            isLoop : true,
            timeScale : 1
        };
        var attack_skipQuest = {
            animName : 'attack_skipQuest',
            isLoop : false,
            timeScale : 1
        };

        runAnimation([attack_skipQuest, idle]);
    }
    
    function attack2Char (){
        movement = 0;
        var idle = {
            animName : 'idle',
            isLoop : true,
            timeScale : 1
        };
        var attack = {
            animName : 'attack',
            isLoop : false,
            timeScale : 2
        };
        runAnimation([attack, idle]);
    }
    
    function damageedChar (){

        var idle = {
            animName : 'run',
            isLoop : true,
            timeScale : 1
        };
        var damage = {
            animName : 'damage',
            isLoop : false,
            timeScale : 1
        };
        if (runAnimation([damage, idle])){
            movement = 0;
            return true;
        }
        else {
            return false;
        }
    
    }
    
    function jumpChar (){
        var idle = {
            animName : 'run',
            isLoop : true,
            timeScale : 1
        };
        var damage = {
            animName : '000000_run_highJump',
            isLoop : false,
            timeScale : 0.5
        };
        runAnimation([damage, idle]);
    }
    
    function dieChar(){
        movement = 0;
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
        animationQueue.length = 0;
        runAnimation([die, stop]);
    }
    
    function useSkill(index){
        var characterSkillDataID = Math.floor(characterID / 100) * 100 + 1;
    
        var skill = {
            animName : characterSkillDataID + '_skill' + index,
            isLoop : false,
            timeScale : 1.5
        };
        var idle = {
            animName : 'idle',
            isLoop : true,
            timeScale : 1
        };
    
        runAnimation([skill, idle] );
    }

    

    function runAnimation( animArray){

        if( animationQueue.length !== 0)
            return false ;

        var firstActionObj =  animArray.shift();
        var firstAction = firstActionObj.animName;

        firstAction = setAnimName(firstAction);



        var AnimEntry = mySkeleton.state.setAnimation(0, firstAction, firstActionObj.isLoop);
        AnimEntry.timeScale = firstActionObj.timeScale;

        animArray.forEach( function(i){
            animationQueue.push( i.animName);
        })
        return true;
    }

    function getSpeed(){
        return movement;
    }

    function setPosition( posX, posY ){
        charPosX = posX;
        charPosY = posY
    }

    function getPosition(){
        return charPos;
    }
    return {
        init : initSpineGL,
        load : loadSpine,
        resize : resize,
        render    : spineRender,
        setPosition : setPosition,
        getPosition : getPosition,
        setDirection : setDirection,

        setDearIdle : setDearIdle,
        setIdle : setIdle,
        run : runChar,
        jump : jumpChar,
        damage : damageedChar,
        attackChar : attackChar,
        getSpeed : getSpeed,

        die : dieChar
    }
}