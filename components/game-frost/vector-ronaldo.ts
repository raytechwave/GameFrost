import {
  type V, type VectorFrame, point, add, sub, mul, blend, clamp, ease,
  n, xy, unit, perpendicular, rotate, ik, path, line, circle, ellipse,
  group, segment, floor, bone,
} from './vector-helpers';

/** An original, connected illustration. The ball and rig share this one clock. */
const CONTACT = .52;
const BALL_RADIUS = 24;
const BALL_START = point(470, 597);
const TOE = point(32, 13);
const CONTACT_ANKLE = sub(point(BALL_START.x - BALL_RADIUS, BALL_START.y), TOE);

function keyed(p: number, values: Array<[number, V]>): V {
  for (let i = 1; i < values.length; i++) {
    if (p <= values[i][0]) {
      const [a, av] = values[i - 1], [b, bv] = values[i];
      return blend(av, bv, ease((p - a) / (b - a)));
    }
  }
  return values[values.length - 1][1];
}

/** One outline follows all three joints, so elbows/knees never become cutouts. */
function anatomy(a: V, b: V, c: V, ra: number, rb: number, rc: number,
  fill: string, shadow: string): string {
  const s1 = perpendicular(unit(sub(b, a))), s2 = perpendicular(unit(sub(c, b)));
  const sj = unit(add(s1, s2));
  const a1 = add(a, mul(s1, ra)), a2 = sub(a, mul(s1, ra));
  const b1 = add(b, mul(sj, rb)), b2 = sub(b, mul(sj, rb));
  const c1 = add(c, mul(s2, rc)), c2 = sub(c, mul(s2, rc));
  const cap = add(c, mul(unit(sub(c, b)), rc * .7));
  const outline = path(`M${xy(a1)} L${xy(blend(a1, b1, .8))}
    Q${xy(b1)} ${xy(blend(b1, c1, .2))} L${xy(c1)} Q${xy(cap)} ${xy(c2)}
    L${xy(blend(c2, b2, .8))} Q${xy(b2)} ${xy(blend(b2, a2, .2))} L${xy(a2)}
    Q${xy(sub(a, mul(unit(sub(b, a)), ra * .45)))} ${xy(a1)} Z`, fill, '#342029', 2.6);
  const inset = mul(sj, ra * -.43);
  return outline + path(`M${xy(add(a, inset))} Q${xy(add(b, inset))} ${xy(add(c, mul(s2, -rc * .5)))}`,
    'none', shadow, Math.max(4, rb * .6), 'opacity=".43"')
    + line(add(a, mul(s1, ra * .5)), blend(a, b, .76), '#ffd9b2', 3, 'opacity=".35"');
}

function hand(wrist: V, elbow: V, id: string): string {
  const angle = Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x) - Math.PI / 2;
  return group(
    path('M-7-4 C-11 1-9 7-8 10 L-11 17 Q-10 21-7 18 L-5 13 L-5 26 Q-3 31-1 26 L0 17 L1 28 Q4 31 5 26 L6 16 L8 25 Q11 28 12 22 L12 13 L14 18 Q18 20 17 14 L12 3 Q7-5-7-4Z',
      `url(#${id}-skin)`, '#40252d', 1.8)
    + path('M-5 8 Q2 12 9 6 M-1 17 L0 12 M5 16 L5 10', 'none', '#a56b53', 1.25), wrist, angle);
}

function boot(ankle: V, angle: number, id: string): string {
  return group(
    path('M-13-8 Q-18-1-16 8 L-15 17 Q-11 22-3 22 L23 22 Q31 21 32 13 Q31 10 25 8 L12 2 L3-12 Q-8-16-13-8Z',
      `url(#${id}-boot)`, '#0b152a', 2.4)
    + path('M-15 17 Q6 20 29 17 L29 21 L-10 24 Q-15 22-15 17Z', '#e6dbbc', '#12213b', 1.4)
    + path('M-3-9 L12 6 L22 10 L17 14 L2 6 L-7-5Z', '#4fd0ff', 'none')
    + path('M-3-5 L3-6 M0-1 L7-2 M4 3 L11 2 M8 7 L16 6', 'none', '#ffeabe', 1.7)
    + path('M-11 23 L-11 27 L-7 27 L-6 23 M4 23 L4 27 L8 27 L9 23 M20 22 L20 26 L24 26 L25 22',
      '#a28b60', '#0b152a', 1), ankle, angle);
}

function sock(knee: V, ankle: V, id: string): string {
  const top = blend(knee, ankle, .32);
  const side = perpendicular(unit(sub(ankle, knee)));
  return segment(top, ankle, 13.8, 10.7, `url(#${id}-sock)`, '#303645', 2)
    + line(add(top, mul(side, 12.8)), sub(top, mul(side, 12.8)), '#c73544', 4)
    + line(add(blend(knee, ankle, .39), mul(side, 13)), sub(blend(knee, ankle, .39), mul(side, 13)), '#286548', 3)
    + line(add(blend(top, ankle, .17), mul(side, -7)), add(blend(top, ankle, .89), mul(side, -6)), '#fff', 2.2, 'opacity=".75"');
}

function face(origin: V, angle: number, id: string): string {
  return group(
    path('M-29-21 Q-39-22-39-9 Q-40 5-29 8 L-24 24 Q-15 42 7 42 Q24 40 31 27 L32 14 L39 5 Q43 2 37-5 L31-13 L30-33 Q-4-51-29-21Z',
      `url(#${id}-skin)`, '#42252b', 2.5)
    + path('M-31-6 Q-36-13-35-4 L-30 2 M23 11 Q19 31 5 37 Q25 35 29 20', 'none', '#a6664c', 3, 'opacity=".75"')
    + path('M-32-13 L-34-27 Q-41-39-27-49 L-27-56 L-16-52 Q-7-63 4-54 L12-61 L21-48 Q34-48 35-34 L31-17 L24-26 Q14-22 8-28 Q-9-18-22-28 L-26-8Z',
      `url(#${id}-hair)`, '#10141c', 2.4)
    + path('M-23-42 Q0-52 24-36 M-25-35 Q-5-42 19-33 M-24-29 L-29-16', 'none', '#536070', 2.1, 'opacity=".75"')
    + path('M-19-13 Q-9-19 1-13 M12-14 Q20-19 28-13', 'none', '#202027', 4)
    + path('M-19-7 Q-10-12 0-6 Q-10-1-19-7Z M12-7 Q20-11 27-6 Q19-1 12-7Z', '#faf2e7', '#543430', 1)
    + ellipse(point(-8, -6), 2.4, 3.3, '#402b26') + ellipse(point(21, -6), 2.4, 3.3, '#402b26')
    + circle(point(-7.2, -7), .8, '#fff') + circle(point(21.8, -7), .8, '#fff')
    + path('M14-5 L12 8 Q18 13 24 8 M-4 19 Q9 15 20 18 Q9 22-4 19', 'none', '#814739', 1.7)
    + path('M1 22 Q9 25 16 21 M-19 0 Q-12 3-7 0 M-15 29 Q-6 34 4 33', 'none', '#b77b5a', 1.5)
    + path('M-26 14 Q-21 29-8 36 M24 18 L22 24', 'none', '#70473d', 1.3, 'opacity=".5"'), origin, angle);
}

function ball(center: V, turn: number, id: string): string {
  return `<g transform="translate(${xy(center)})"><circle r="24" fill="url(#${id}-ball)" stroke="#24313f" stroke-width="1.6"/>`
    + `<g clip-path="url(#${id}-ball-clip)" transform="rotate(${n(turn)})">`
    + path('M-8-10 L7-12 L15 1 L6 13 L-9 9 L-13-3Z', '#152332', '#152332', 1)
    + path('M-8-10 L-12-23 M7-12 L14-23 M15 1 L26 2 M6 13 L8 26 M-9 9 L-21 20 M-13-3 L-27-7', 'none', '#647480', 1.4)
    + path('M-23-18 L-12-23 L-9-18 L-14-10 L-25-12Z M12-26 L26-13 L25-4 L17-5 L12-17Z M19 18 L8 26 L4 20 L10 14 L18 11Z M-26 7 L-17 8 L-14 15 L-21 22 L-27 14Z', '#243441', 'none')
    + path('M-14-10 L-17 8 M-9-18 L12-17 M17-5 L18 11 M10 14 L-14 15', 'none', '#7f8b91', 1.1)
    + '</g>' + ellipse(point(-8, -11), 8, 4, '#fff', 'opacity=".45" transform="rotate(-32 -8 -11)"') + '</g>';
}

export function renderRonaldo(progress: number, id: string): VectorFrame {
  const p = clamp(progress);
  const hip = keyed(p, [[0, point(315, 436)], [.26, point(326, 434)], [.42, point(315, 433)], [.52, point(332, 428)], [.78, point(340, 439)], [1, point(315, 436)]]);
  const lean = keyed(p, [[0, point(-.035, 0)], [.26, point(-.065, 0)], [.42, point(-.115, 0)], [.52, point(.095, 0)], [.78, point(.135, 0)], [1, point(-.035, 0)]]).x;
  const local = (v: V) => add(hip, rotate(v, lean));
  const leftHip = local(point(-17, 2)), rightHip = local(point(17, 2));
  const leftShoulder = local(point(-39, -133)), rightShoulder = local(point(37, -134));
  const leftFoot = point(304, 598);
  const rightTarget = keyed(p, [[0, point(365, 598)], [.26, point(352, 591)], [.42, point(266, 530)], [.52, CONTACT_ANKLE], [.78, point(504, 493)], [1, point(365, 598)]]);
  const bootAngle = keyed(p, [[0, point(0, 0)], [.26, point(-.08, 0)], [.42, point(-.53, 0)], [.52, point(0, 0)], [.78, point(-.43, 0)], [1, point(0, 0)]]).x;
  const leftLeg = ik(leftHip, leftFoot, 86, 90, -1);
  const rightLeg = ik(rightHip, rightTarget, 86, 90, -1);
  const leftTarget = keyed(p, [[0, point(255, 412)], [.26, point(235, 383)], [.42, point(220, 337)], [.52, point(223, 331)], [.78, point(241, 351)], [1, point(255, 412)]]);
  const rightHandTarget = keyed(p, [[0, point(399, 397)], [.26, point(410, 367)], [.42, point(424, 327)], [.52, point(416, 386)], [.78, point(432, 340)], [1, point(399, 397)]]);
  const leftArm = ik(leftShoulder, leftTarget, 70, 66, 1);
  const rightArm = ik(rightShoulder, rightHandTarget, 70, 66, -1);
  const head = local(point(4, -219));
  const bootContact = add(rightLeg.end, rotate(TOE, bootAngle));
  const flight = clamp((p - CONTACT) / (1 - CONTACT));
  const ballCenter = add(BALL_START, point(225 * flight, -260 * flight + 160 * flight * flight));
  const impact = p > CONTACT && p < .62 ? Math.sin(Math.PI * (p - CONTACT) / .1) : 0;
  const phase = p < .26 ? 'Set the stance' : p < .42 ? 'Load the striking leg' : p < CONTACT ? 'Swing into the ball' : p === CONTACT ? 'Boot meets ball' : p < .78 ? 'Kick and follow through' : 'Recover the stance';
  const skin = `url(#${id}-skin)`;
  let markup = `<defs>
    <linearGradient id="${id}-skin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f0bd8f"/><stop offset=".48" stop-color="#d89b70"/><stop offset="1" stop-color="#ae6f51"/></linearGradient>
    <linearGradient id="${id}-jersey" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f44350"/><stop offset=".45" stop-color="#c92039"/><stop offset="1" stop-color="#841529"/></linearGradient>
    <linearGradient id="${id}-shorts"><stop stop-color="#213e36"/><stop offset=".55" stop-color="#162720"/><stop offset="1" stop-color="#0c1718"/></linearGradient>
    <linearGradient id="${id}-sock"><stop stop-color="#fffef3"/><stop offset=".6" stop-color="#e3e9e6"/><stop offset="1" stop-color="#afc0c6"/></linearGradient>
    <linearGradient id="${id}-boot" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#368fc0"/><stop offset=".55" stop-color="#175384"/><stop offset="1" stop-color="#09213d"/></linearGradient>
    <linearGradient id="${id}-hair" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#333944"/><stop offset="1" stop-color="#0d1017"/></linearGradient>
    <radialGradient id="${id}-ball" cx=".32" cy=".25"><stop stop-color="#fffef2"/><stop offset=".6" stop-color="#e0e9e8"/><stop offset="1" stop-color="#788e9e"/></radialGradient>
    <clipPath id="${id}-ball-clip"><circle r="23.6"/></clipPath>
  </defs>`;
  markup += floor(id, hip.x + 15, 625, 157, .36);
  markup += ellipse(point(ballCenter.x, 624), 29 + flight * 10, 5.7, '#030914', `opacity="${n(.33 - flight * .15)}"`);
  markup += ellipse(point(304, 625), 30, 5, '#0a131d', 'opacity=".34"');
  // The far arm is behind the shirt; connected hips remain under the shorts.
  markup += anatomy(rightArm.origin, rightArm.joint, rightArm.end, 16, 11, 8, skin, '#965e48') + hand(rightArm.end, rightArm.joint, id);
  markup += anatomy(leftLeg.origin, leftLeg.joint, leftLeg.end, 20, 16, 10, skin, '#946047');
  markup += sock(leftLeg.joint, leftLeg.end, id) + boot(leftLeg.end, 0, id);
  markup += anatomy(rightLeg.origin, rightLeg.joint, rightLeg.end, 21, 16, 10.5, skin, '#946047');
  markup += sock(rightLeg.joint, rightLeg.end, id) + boot(rightLeg.end, bootAngle, id);
  markup += segment(leftLeg.origin, blend(leftLeg.origin, leftLeg.joint, .47), 23, 21, `url(#${id}-shorts)`, '#0b1719', 2.5)
    + segment(rightLeg.origin, blend(rightLeg.origin, rightLeg.joint, .47), 23, 21, `url(#${id}-shorts)`, '#0b1719', 2.5);
  markup += group(path('M-28-10 Q0-20 28-10 L32 20 Q0 31-32 20Z', `url(#${id}-shorts)`, '#0c1b1b', 2.5)
    + path('M-25-4 Q0 2 25-4 M-1 4 L-3 22 M-25 18 L-27 26', 'none', '#456455', 2)
    + path('M14 9 L23 9 L17 14 L13 24 L8 24 L13 13 L8 13 L8 9Z', '#f5eac8', 'none'), hip, lean);
  markup += anatomy(leftArm.origin, leftArm.joint, leftArm.end, 16, 11.5, 8, skin, '#965e48') + hand(leftArm.end, leftArm.joint, id);
  markup += group(
    path('M-14-182 L-15-142 Q0-124 17-143 L15-183Z', skin, '#42252b', 2)
    + path('M-39-139 Q-51-126-45-100 L-29-6 Q0 5 29-6 L41-106 Q50-126 36-139 Q23-148 13-145 Q1-133-12-145 Q-23-149-39-139Z', `url(#${id}-jersey)`, '#4c1228', 3)
    + path('M-39-139 L-54-125 L-49-100 L-32-103 L-24-128 M36-139 L52-124 L46-100 L31-103 L24-129', `url(#${id}-jersey)`, '#661c2b', 2)
    + path('M-51-106 L-32-109 M34-109 L49-106', 'none', '#2d7953', 6)
    + path('M-14-145 Q0-134 14-145', 'none', '#246749', 7)
    + path('M-13-144 Q0-135 13-144', 'none', '#a1a156', 1.2)
    + path('M-27-121 Q-32-68-21-20 M29-125 Q38-72 22-15 M-17-12 Q-3-20 8-13 M14-37 L26-44', 'none', '#710e2b', 2.2, 'opacity=".65"')
    + path('M-20-108 L19-108 L19-99 L1-58 L-11-58 L7-97 L-20-97Z', '#fff0d0', '#97182e', 1.5)
    + path('M-23-119 L-17-128 L-12-120 L-17-111Z', '#e5bb6b', '#4b653c', 1.2)
    + path('M-33-76 Q-22-60-27-41 M7-24 Q16-30 25-22', 'none', '#fc6871', 2, 'opacity=".55"'), hip, lean);
  markup += face(head, lean * .32, id);
  if (flight > 0) {
    const direction = unit(point(225, -260 + 320 * flight));
    const back = sub(ballCenter, mul(direction, 38 + 24 * flight));
    markup += line(back, sub(ballCenter, mul(direction, 28)), '#c8f4ff', 9, 'opacity=".12"')
      + line(sub(ballCenter, mul(direction, 53)), sub(ballCenter, mul(direction, 31)), '#f8ebc6', 2.5, 'opacity=".45"');
  }
  markup += ball(ballCenter, flight * 390, id);
  if (impact > 0) {
    const strike = point(BALL_START.x - BALL_RADIUS, BALL_START.y);
    const radius = 12 + (p - CONTACT) * 280;
    markup += circle(strike, radius, 'none', '#fff0c9', 2.5, `opacity="${n(impact * .64)}"`);
    for (let i = 0; i < 5; i++) {
      const a = -.9 + i * .46;
      markup += line(add(strike, rotate(point(radius + 3, 0), a)), add(strike, rotate(point(radius + 13, 0), a)), '#f5de9b', 2, `opacity="${n(impact * .65)}"`);
    }
  }
  const anchors = {
    leftHand: leftArm.end, rightHand: rightArm.end, head,
    leftFoot: leftLeg.end, rightFoot: rightLeg.end, bootContact,
    ballCenter, effectOrigin: bootContact, leftHip, rightHip,
    leftKnee: leftLeg.joint, rightKnee: rightLeg.joint,
    leftShoulder, rightShoulder, leftElbow: leftArm.joint, rightElbow: rightArm.joint,
  };
  return { markup, anchors, phase, contact: { foot: bootContact, ball: ballCenter, radius: BALL_RADIUS, released: p > CONTACT },
    bones: [bone('leftUpperArm', leftArm.origin, leftArm.joint), bone('leftForearm', leftArm.joint, leftArm.end),
      bone('rightUpperArm', rightArm.origin, rightArm.joint), bone('rightForearm', rightArm.joint, rightArm.end),
      bone('leftThigh', leftLeg.origin, leftLeg.joint), bone('leftShin', leftLeg.joint, leftLeg.end),
      bone('rightThigh', rightLeg.origin, rightLeg.joint), bone('rightShin', rightLeg.joint, rightLeg.end)] };
}
