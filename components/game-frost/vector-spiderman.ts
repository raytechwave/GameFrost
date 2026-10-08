import {
  type V, type VectorFrame, point, add, sub, mul, blend, clamp, ease, ramp,
  windowed, n, xy, rotate, unit, perpendicular, ik, path, line, circle,
  ellipse, group, segment, limb, floor, bone,
} from './vector-helpers';

/**
 * Original, rigged vector illustration. Joint positions, suit panels, fingers,
 * and the wrist web all use the same reversible progress value. No bitmap
 * backgrounds, detached sprite limbs, elapsed-time loops, or random particles.
 */
export function renderSpiderMan(progress: number, id: string): VectorFrame {
  const p = clamp(progress);
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '');
  const red = `url(#${safeId}-red)`, blue = `url(#${safeId}-blue)`;
  const brightRed = `url(#${safeId}-glove)`, ink = '#080f24';
  const stops = [0, .28, .44, .62, .86, 1];
  const roots = [point(318, 442), point(309, 480), point(325, 455), point(334, 442), point(327, 446), point(318, 442)];
  const leans = [-.045, .08, .16, .23, .14, -.045];
  const rightTargets = [point(399, 403), point(416, 378), point(537, 283), point(548, 260), point(506, 316), point(399, 403)];
  const leftTargets = [point(250, 433), point(226, 446), point(237, 415), point(235, 411), point(245, 425), point(250, 433)];
  let k = 0;
  while (k < stops.length - 2 && p > stops[k + 1]) k++;
  const t = ease((p - stops[k]) / (stops[k + 1] - stops[k]));
  const hip = blend(roots[k], roots[k + 1], t);
  const lean = leans[k] + (leans[k + 1] - leans[k]) * t;
  const chest = add(hip, rotate(point(0, -122), lean));
  const local = (x: number, y: number): V => add(chest, rotate(point(x, y), lean));
  const head = local(3, -66), neck = local(0, -24);
  const shoulderLeft = local(-43, -9), shoulderRight = local(43, -13);
  const hipLeft = local(-25, 116), hipRight = local(26, 116);
  const footLeft = point(250, 607), footRight = point(406, 607);
  const leftArm = ik(shoulderLeft, blend(leftTargets[k], leftTargets[k + 1], t), 85, 88, 1);
  const rightArm = ik(shoulderRight, blend(rightTargets[k], rightTargets[k + 1], t), 86, 92, 1);
  const leftLeg = ik(hipLeft, footLeft, 103, 110, 1);
  const rightLeg = ik(hipRight, footRight, 103, 110, -1);
  const wrist = rightArm.end;
  const target = point(694, 191);
  const shotAngle = Math.atan2(target.y - wrist.y, target.x - wrist.x);
  const intent = windowed(p, .22, .44, .86, 1);
  const webVisibility = windowed(p, .44, .475, .86, .965);
  const reach = ramp(p, .44, .585);
  const tip = blend(wrist, target, reach);
  const tangent = unit(sub(tip, wrist)), normal = perpendicular(tangent);
  const slack = 12 * (1 - ramp(p, .51, .67)) + 6 * ramp(p, .78, .9);
  const middle = add(blend(wrist, tip, .5), mul(normal, slack));

  const defs = `<defs>
    <linearGradient id="${safeId}-red" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f34c57"/><stop offset=".32" stop-color="#c9213c"/><stop offset=".72" stop-color="#aa122d"/><stop offset="1" stop-color="#580d29"/></linearGradient>
    <linearGradient id="${safeId}-glove" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ff6a65"/><stop offset=".38" stop-color="#dc2e40"/><stop offset="1" stop-color="#85112f"/></linearGradient>
    <linearGradient id="${safeId}-blue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#388bca"/><stop offset=".34" stop-color="#155da5"/><stop offset=".76" stop-color="#143476"/><stop offset="1" stop-color="#101b49"/></linearGradient>
    <linearGradient id="${safeId}-eye" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset=".7" stop-color="#e0eef9"/><stop offset="1" stop-color="#88b4d2"/></linearGradient>
    <radialGradient id="${safeId}-web-light"><stop stop-color="#b4f1ff" stop-opacity=".55"/><stop offset="1" stop-color="#b4f1ff" stop-opacity="0"/></radialGradient>
  </defs>`;

  /** A suit web wraps each joint-derived segment in its local coordinates. */
  function webbedSegment(a: V, b: V, radius: number, bands = 5): string {
    const v = sub(b, a), angle = Math.atan2(v.y, v.x), distance = Math.hypot(v.x, v.y);
    let m = line(point(3, 0), point(distance - 4, 0), '#480c2a', 1.35, 'opacity=".82"');
    m += line(point(4, -radius * .56), point(distance - 5, -radius * .52), '#550d2d', 1.15, 'opacity=".75"');
    m += line(point(4, radius * .55), point(distance - 5, radius * .52), '#550d2d', 1.15, 'opacity=".75"');
    for (let i = 1; i <= bands; i++) {
      const x = (distance - 8) * i / (bands + 1) + 4;
      m += path(`M${n(x - 3)} ${n(-radius * .84)} Q${n(x + 6)} 0 ${n(x - 3)} ${n(radius * .84)}`, 'none', '#4c0c2b', 1.15, 'opacity=".82"');
    }
    return group(m, a, angle);
  }

  function boot(ankle: V, knee: V, side: number): string {
    const start = blend(knee, ankle, .3);
    const bootShaft = segment(start, ankle, 18, 14, red, ink, 2.8);
    const toe = add(ankle, point(side * 37, 11));
    const heel = add(ankle, point(-side * 13, 15));
    const top = add(ankle, point(side * 12, -9));
    const shape = path(`M${xy(top)} Q${xy(add(ankle, point(-side * 14, -3)))} ${xy(heel)} Q${xy(add(ankle, point(side * 12, 22)))} ${xy(toe)} Q${xy(add(toe, point(side * 4, -5)))} ${xy(add(ankle, point(side * 13, 1)))} Z`, red, ink, 3);
    const sole = path(`M${xy(heel)} Q${xy(add(ankle, point(side * 8, 21)))} ${xy(toe)}`, 'none', '#0b1428', 5);
    const highlight = line(add(ankle, point(side * 8, 1)), add(toe, point(-side * 6, -2)), '#ff8585', 2, 'opacity=".65"');
    return bootShaft + webbedSegment(start, ankle, 15, 6) + shape + sole + highlight;
  }

  function arm(a: V, elbow: V, end: V, front: boolean): string {
    const gloveStart = blend(elbow, end, .26);
    let m = limb(a, elbow, end, front ? 20 : 18, 14, blue, '#080e36');
    // Deltoid and triceps shape rather than a straight tube.
    m += segment(a, blend(a, elbow, .46), 21, 18, red, ink, 2.6);
    m += webbedSegment(a, blend(a, elbow, .46), 16, 3);
    m += path(`M${xy(blend(a, elbow, .12))} Q${xy(add(elbow, point(0, -10)))} ${xy(blend(elbow, end, .1))}`, 'none', '#7dc4e6', 2.4, 'opacity=".45"');
    m += segment(gloveStart, end, 16, 12, brightRed, ink, 2.5);
    m += webbedSegment(gloveStart, end, 13, 5);
    m += circle(elbow, 5, '#131e4c', 'none', 0, 'opacity=".4"');
    m += line(blend(gloveStart, end, .15), blend(gloveStart, end, .8), '#ff8990', 2.1, 'opacity=".45"');
    return m;
  }

  function athleticLeg(a: V, knee: V, ankle: V): string {
    const upperNormal = perpendicular(unit(sub(knee, a)));
    const lowerNormal = perpendicular(unit(sub(ankle, knee)));
    const jointNormal = unit(add(upperNormal, lowerNormal));
    const offset = (v: V, normal: V, amount: number) => add(v, mul(normal, amount));
    const aOut = offset(a, upperNormal, 26), aIn = offset(a, upperNormal, -26);
    const kneeOut = offset(knee, jointNormal, 22), kneeIn = offset(knee, jointNormal, -22);
    const footOut = offset(ankle, lowerNormal, 14), footIn = offset(ankle, lowerNormal, -14);
    const upperOut = offset(blend(a, knee, .54), upperNormal, 29);
    const upperIn = offset(blend(a, knee, .54), upperNormal, -26);
    const lowerOut = offset(blend(knee, ankle, .46), lowerNormal, 24);
    const lowerIn = offset(blend(knee, ankle, .46), lowerNormal, -21);
    let m = path(`M${xy(aOut)} Q${xy(upperOut)} ${xy(kneeOut)} Q${xy(lowerOut)} ${xy(footOut)} Q${xy(add(ankle, mul(unit(sub(ankle, knee)), 14)))} ${xy(footIn)} Q${xy(lowerIn)} ${xy(kneeIn)} Q${xy(upperIn)} ${xy(aIn)} Q${xy(sub(a, mul(unit(sub(knee, a)), 22)))} ${xy(aOut)} Z`, blue, ink, 3);
    m += path(`M${xy(offset(blend(a, knee, .1), upperNormal, -13))} Q${xy(offset(blend(a, knee, .58), upperNormal, -17))} ${xy(offset(knee, jointNormal, -12))} Q${xy(offset(blend(knee, ankle, .47), lowerNormal, -15))} ${xy(offset(blend(knee, ankle, .8), lowerNormal, -9))}`, 'none', '#0b2255', 7, 'opacity=".45"');
    m += path(`M${xy(offset(knee, jointNormal, 11))} Q${xy(add(knee, mul(unit(sub(knee, a)), 7)))} ${xy(offset(knee, jointNormal, -8))}`, 'none', '#183869', 2.3, 'opacity=".75"');
    m += path(`M${xy(offset(blend(a, knee, .23), upperNormal, 13))} Q${xy(offset(blend(a, knee, .46), upperNormal, 18))} ${xy(offset(blend(a, knee, .74), upperNormal, 13))}`, 'none', '#6abbdf', 2.3, 'opacity=".45"');
    return m;
  }

  const legs = athleticLeg(hipLeft, leftLeg.joint, leftLeg.end)
    + athleticLeg(hipRight, rightLeg.joint, rightLeg.end)
    + line(blend(hipLeft, leftLeg.joint, .2), blend(hipLeft, leftLeg.joint, .8), '#64c7eb', 3, 'opacity=".45"')
    + line(blend(hipRight, rightLeg.joint, .22), blend(hipRight, rightLeg.joint, .85), '#64c7eb', 3, 'opacity=".48"')
    + boot(leftLeg.end, leftLeg.joint, -1) + boot(rightLeg.end, rightLeg.joint, 1);

  let torso = path('M-38 -23 Q-14 -34 6 -31 Q28 -31 44 -20 L55 5 Q40 25 36 49 L28 91 Q38 103 37 119 Q17 136 -8 131 Q-31 132 -39 118 L-29 88 Q-33 55 -46 24 L-53 5 Z', blue, ink, 3.5);
  torso += path('M-22 -26 Q0 -36 22 -28 L30 -7 Q23 13 27 32 L17 78 Q14 99 25 116 Q4 126 -19 119 Q-13 101 -19 81 L-27 29 Q-23 9 -29 -10 Z', red, ink, 2);
  torso += path('M-38 -23 Q-17 -35 -7 -28 L-13 -8 Q-30 -4 -47 9 L-53 4 Z', red, ink, 2);
  torso += path('M22 -28 Q39 -28 45 -19 L55 4 L39 16 L29 -2 Z', red, ink, 2);
  torso += path('M-36 108 Q-5 113 32 106 L37 118 Q2 134 -39 118 Z', red, ink, 2);
  torso += path('M-35 14 Q-25 16 -22 33 M32 14 Q25 24 26 37 M-30 48 Q-22 47 -19 62 M26 53 Q19 58 18 72', 'none', '#74bae0', 2.2, 'opacity=".55"');
  torso += path('M-23 -6 Q-9 1 3 -2 Q13 3 27 -5 M-20 39 Q-5 44 22 38 M-17 58 Q-2 63 20 57 M-16 79 Q1 84 18 78 M-15 99 Q-1 104 21 98', 'none', '#7a122e', 2, 'opacity=".7"');
  // Concentric stitched web panels conform to the illustrated chest and waist.
  for (const x of [-14, -3, 9, 19]) torso += path(`M${x} -26 Q${x - 3} 20 ${x} 58 Q${x + 2} 87 ${x} 112`, 'none', '#5b0c29', 1.2, 'opacity=".85"');
  for (const y of [-17, -5, 10, 27, 44, 61, 79, 96, 112]) torso += path(`M${n(-22 + y * .03)} ${y} Q0 ${y + 10} ${n(25 - y * .035)} ${y}`, 'none', '#560c2b', 1.2, 'opacity=".82"');
  torso += path('M-29 -21 Q-36 -12 -46 -4 M-25 -16 Q-35 -4 -48 1 M29 -21 Q38 -10 48 -4 M32 -14 Q40 -6 50 2', 'none', '#620e2d', 1.2);
  torso += path('M-34 110 Q-4 119 32 110 M-32 117 Q-4 126 29 117', 'none', '#5f0925', 1.2);
  // Icon: an articulated spider, including all eight connected legs.
  let spider = ellipse(point(2, 27), 4.2, 6.5, ink) + ellipse(point(2, 38), 5.5, 9, ink);
  for (const side of [-1, 1]) {
    spider += path(`M${2 + side * 2} 28 L${2 + side * 9} 20 L${2 + side * 14} 13 M${2 + side * 3} 32 L${2 + side * 14} 26 L${2 + side * 21} 24 M${2 + side * 4} 36 L${2 + side * 15} 38 L${2 + side * 20} 45 M${2 + side * 3} 42 L${2 + side * 10} 51 L${2 + side * 12} 61`, 'none', ink, 2.7);
  }
  torso += spider + path('M-12 -24 Q-5 -27 4 -27 M-17 71 L-15 92 M-32 11 Q-37 31 -31 43', 'none', '#ff8991', 2.4, 'opacity=".52"');

  const focus = .8 + intent * .2;
  let mask = path('M-25 -31 Q-9 -46 12 -40 Q33 -34 36 -16 Q43 1 32 24 Q22 39 6 44 Q-16 36 -28 19 Q-42 -8 -25 -31 Z', brightRed, ink, 3.3);
  mask += path('M-25 -31 Q-32 -9 -22 17 Q-13 31 4 40 L6 44 Q-16 36 -28 19 Q-42 -8 -25 -31 Z', '#83102e', 'none', 0, 'opacity=".7"');
  mask += path('M-15 -34 Q2 -42 17 -32 M21 -29 Q32 -17 32 -6', 'none', '#ff9ba0', 2.2, 'opacity=".65"');
  // Radial web pattern is part of the mask, not overlaid screen-space lines.
  for (const q of [point(-25, -31), point(-34, -7), point(-25, 22), point(5, 43), point(30, 27), point(37, 2), point(27, -31), point(4, -40)]) mask += line(point(7, -4), q, '#630c2a', 1.3, 'opacity=".85"');
  mask += path('M-25 -22 Q-2 -34 29 -23 M-32 -9 Q-7 -21 36 -10 M-30 5 Q-7 -5 38 5 M-23 21 Q0 10 31 18 M-11 34 Q10 25 22 31', 'none', '#5e0d2a', 1.4, 'opacity=".9"');
  mask += path(`M-28 -14 Q-15 ${n(-21 + intent * 3)} 1 -7 Q-8 ${n(13 * focus)} -21 10 Q-30 3 -28 -14 Z`, ink, ink, 2.5);
  mask += path(`M-25 -12 Q-14 ${n(-16 + intent * 3)} -3 -7 Q-10 ${n(9 * focus)} -20 6 Q-26 1 -25 -12 Z`, `url(#${safeId}-eye)`, 'none', 0);
  mask += path(`M8 -7 Q22 ${n(-26 + intent * 3)} 34 -18 Q34 5 20 15 Q9 12 8 -7 Z`, ink, ink, 2.5);
  mask += path(`M12 -6 Q23 ${n(-21 + intent * 3)} 31 -15 Q30 4 20 10 Q13 8 12 -6 Z`, `url(#${safeId}-eye)`, 'none', 0);
  mask += path('M-21 -10 Q-15 -13 -9 -10 M17 -7 Q24 -15 27 -13', 'none', '#ffffff', 1.7, 'opacity=".75"');

  let leftHand = path('M-8 -12 L8 -13 Q19 -11 21 -1 L20 13 Q12 22 -3 15 L-12 7 Z', brightRed, ink, 2.5);
  leftHand += path('M3 -11 L13 -9 L16 -1 M-2 -6 L14 -2 M-3 1 L16 5 M1 8 L13 12', 'none', '#550b2b', 1.4);
  leftHand += path('M-8 -4 Q-15 -6 -13 1 L-5 9', red, ink, 2);

  let rightHand = path('M-7 -12 L8 -13 Q16 -12 18 -7 L18 7 Q15 15 4 13 L-8 9 Z', brightRed, ink, 2.5);
  // Extended index/little finger and folded middle pair form the web-shooter pose.
  rightHand += path(`M5 -10 Q12 -14 18 -16 L${n(24 + intent * 12)} ${n(-18 + intent * 3)} Q${n(31 + intent * 9)} ${n(-16 + intent * 3)} ${n(25 + intent * 10)} ${n(-11 + intent * 3)} L13 -5 Z`, brightRed, ink, 2.1);
  rightHand += path(`M9 9 L${n(20 + intent * 10)} ${n(15 + intent * 7)} Q${n(27 + intent * 10)} ${n(19 + intent * 7)} ${n(23 + intent * 7)} ${n(24 + intent * 2)} L12 15 Z`, red, ink, 2.1);
  rightHand += path('M15 -1 Q29 -3 25 4 L12 6 M15 4 Q27 7 20 12 L9 10 M-1 -3 Q7 -7 14 -3', brightRed, ink, 2.1);
  rightHand += path('M-5 -8 L6 -8 M-5 1 L8 1 M-1 8 L8 8 M13 -12 L17 -10 M24 -14 L25 -11', 'none', '#530b28', 1.2);
  rightHand += path('M-3 -10 L5 -10', 'none', '#ffa0a0', 1.7, 'opacity=".6"');

  let web = '';
  if (webVisibility > .0001 && reach > .0001) {
    const d = `M${xy(wrist)} Q${xy(middle)} ${xy(tip)}`;
    web += `<g opacity="${n(webVisibility)}">`;
    web += path(d, 'none', '#82d6ee', 7, 'opacity=".1"');
    web += path(d, 'none', '#0f3455', 4, 'opacity=".65"');
    web += path(d, 'none', '#f2fbff', 2.2);
    for (const side of [-1, 1]) {
      const curve = add(middle, mul(normal, side * 6 * reach));
      web += path(`M${xy(wrist)} Q${xy(curve)} ${xy(tip)}`, 'none', '#c6edf8', 1.05, 'opacity=".68"');
    }
    web += circle(tip, 2.8, '#f8feff');
    if (reach > .98) {
      const impact = ramp(p, .575, .625) * (1 - ramp(p, .76, .9));
      web += `<g opacity="${n(impact)}">`;
      for (let j = 0; j < 8; j++) {
        const angle = j * Math.PI / 4;
        const q = add(target, rotate(point(8 + j % 2 * 4, 0), angle));
        web += line(target, q, '#d9f6ff', 1.15);
      }
      web += path(`M${xy(add(target, point(-8, -5)))} Q${xy(add(target, point(-3, -13)))} ${xy(add(target, point(7, -7)))} Q${xy(add(target, point(14, 0)))} ${xy(add(target, point(7, 7)))} Q${xy(add(target, point(-4, 11)))} ${xy(add(target, point(-8, -5)))}`, 'none', '#d9f6ff', 1.1);
      web += '</g>';
    }
    web += '</g>';
  }

  const neckShape = segment(neck, add(head, point(0, 29)), 15, 15, red, ink, 2.7);
  const backArm = arm(shoulderLeft, leftArm.joint, leftArm.end, false)
    + group(leftHand, leftArm.end, Math.atan2(leftArm.end.y - leftArm.joint.y, leftArm.end.x - leftArm.joint.x));
  const frontArm = arm(shoulderRight, rightArm.joint, rightArm.end, true);
  const emitter = webVisibility > .001 ? circle(wrist, 3.5, '#bdf0ff', '#eafbff', 1, `opacity="${n(webVisibility)}"`) : '';
  const markup = defs + floor(safeId, 325, 627, 156, .43)
    + legs + backArm + group(torso, chest, lean) + neckShape
    + group(mask, head, lean * .22 - .035) + frontArm + web
    + group(rightHand, wrist, shotAngle) + emitter;

  return {
    markup,
    phase: p < .28 ? 'Crouch and load' : p < .44 ? 'Aim the wrist' : p < .62 ? 'Web release' : p < .86 ? 'Tether and follow through' : 'Recover the stance',
    anchors: {
      head, leftHand: leftArm.end, rightHand: wrist,
      effectOrigin: wrist, effectTarget: target,
      leftShoulder: shoulderLeft, rightShoulder: shoulderRight,
      leftElbow: leftArm.joint, rightElbow: rightArm.joint,
      leftHip: hipLeft, rightHip: hipRight,
      leftKnee: leftLeg.joint, rightKnee: rightLeg.joint,
      leftFoot: leftLeg.end, rightFoot: rightLeg.end,
    },
    bones: [
      bone('spine', chest, hip),
      bone('left upper arm', shoulderLeft, leftArm.joint), bone('left forearm', leftArm.joint, leftArm.end),
      bone('right upper arm', shoulderRight, rightArm.joint), bone('right forearm', rightArm.joint, rightArm.end),
      bone('left thigh', hipLeft, leftLeg.joint), bone('left shin', leftLeg.joint, leftLeg.end),
      bone('right thigh', hipRight, rightLeg.joint), bone('right shin', rightLeg.joint, rightLeg.end),
    ],
  };
}
