---
title: Drawing Smooth Cubic Bezier Curves
tags: project
p: project
categories: project
description: How to draw a smooth Bezier curve with cubic segments — choosing between quadratic and cubic curves, computing the two control points from the midpoint and slope of the start-to-end line, and drawing it on canvas.
date: 2021-08-21 19:11:33
mathjax: true
keywords: 'cubic bezier curve, bezier curve algorithm, smooth curve on canvas, curve fitting, mouse trajectory smoothing, bezier curve javascript'
lang: en
translationKey: 绘制平滑的三次贝塞尔曲线
---

<img src="/images/ezgif.com-gif-maker.gif"/>


## Prerequisites

What you should know before reading:

+ The canvas coordinate system
+ The midpoint formula for two points in Cartesian coordinates
+ The distance formula for two points in Cartesian coordinates
+ Basic trigonometry
+ The basics of projection
+ Drawing Bezier curves on canvas

## The Problems
### 1. Quadratic Bezier curve or cubic Bezier curve?

### 2. Calculating the Bezier control points

## Analyzing the Problem

### Problem 1:

A quadratic Bezier curve has only a single bend, so when several of them are joined across multiple nodes the result looks poor. On top of that, at 45°, 135°, 225° and 315° special handling is required — otherwise the resulting curve bulges too far.

### Problem 2:

Once cubic Bezier curves are chosen, the two control points C1 and C2 used when drawing the curve have to be computed, and then the curve is drawn with `CanvasRenderingContext2D.bezierCurveTo`.

Because we need two control points, we divide the line **S-E** between the start point **SP (start point)** and the end point **EP (end point)** into 4 equal parts, which gives the following point:
$$
\begin{align*}
Split_{m} = (\frac{(X_{SP}+X_{EP})}2,\frac{(Y_{SP}+Y_{EP})}2)\\
\end{align*}
$$
The formula L(x) for S-E is then
$$
L(x) = \frac{X_{Split_{m}}}{Y_{Slit_{m}}}x
$$
From L(x), the slope of S-E satisfies
$$
\tan \theta = \frac{X_{Split_{m}}}{Y_{Slit_{m}}}
$$
Then, taking $Split_{m}$ as the origin of a Cartesian coordinate system, we get
$$
\begin{align*}
len = \sqrt{(X_{Split_{m}}-X_{SP})^{2}+(Y_{Split_{m}}-Y_{SP})^{2}}\\
\\
\theta = \arctan \frac{X_{Split_{m}}}{Y_{Slit_{m}}}\\
\\
Y_{offset} = len·\cos \theta \\
\\
C1=(X_{Split_{m}},Y_{Split_{m}}-len)\\
C2=(X_{Split_{m}},Y_{Split_{m}}+len)
\end{align*}
$$

## The Code

``` typescript
/**
 * @param props 
 * @typeof props {
		start: number[];
		end: number[];
		canvas: CanvasRenderingContext2D;
	}
 */
export const drawLine = (props: Common.LineProps) => {
	const { start, end, canvas: ctx, color } = props;

	const getMidCoord = (c1: number, c2: number) => {
		if (c1 === c2) {
			return c1;
		}
		return (c1 + c2) / 2;
	};

	const [x1, y1] = start;
	const [x2, y2] = end;
	const [midX, midY] = [getMidCoord(x1, x2), getMidCoord(y1, y2)];
	const drawMirror = (y1: number, y2: number) => {
		if (y1 > y2) {
			return ctx.bezierCurveTo(control2[0], control2[1], control1[0], control1[1], end[0], end[1]);
		} else {
			return ctx.bezierCurveTo(control1[0], control1[1], control2[0], control2[1], end[0], end[1]);
		}
	};
	const degCos = Math.cos(Math.atan((x1 - midX) / (y1 - midY)));

	const lineLen = Math.sqrt(Math.pow(y1 - midY, 2) + Math.pow(x1 - midX, 2)) * 2;

	const control1 = [midX, midY - degCos * (lineLen / 2)];
	const control2 = [midX, midY + degCos * (lineLen / 2)];

	ctx.beginPath();
	ctx.moveTo(start[0], start[1]);
	drawMirror(y1, y2);
	ctx.lineWidth = 2;
	ctx.strokeStyle = color ? color : "#000";
	ctx.stroke();
	ctx.closePath();
};

```
