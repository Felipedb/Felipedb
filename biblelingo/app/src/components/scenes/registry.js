// Despacho dos formatos de cena (SCENE_REGISTRY[ex.type]) — porta de SCENE_RENDER.
import SceneIntro from "./SceneIntro.jsx";
import SceneRead from "./SceneRead.jsx";
import SceneMissing from "./SceneMissing.jsx";
import SceneListen from "./SceneListen.jsx";
import SceneReply from "./SceneReply.jsx";
import SceneBuild from "./SceneBuild.jsx";
import SceneGap from "./SceneGap.jsx";
import SceneSpeak from "./SceneSpeak.jsx";
import SceneTruth from "./SceneTruth.jsx";

export const SCENE_REGISTRY = {
  "scene-intro": SceneIntro,
  "scene-read": SceneRead,
  "scene-missing": SceneMissing,
  "scene-listen": SceneListen,
  "scene-reply": SceneReply,
  "scene-build": SceneBuild,
  "scene-gap": SceneGap,
  "scene-speak": SceneSpeak,
  "scene-truth": SceneTruth,
};
