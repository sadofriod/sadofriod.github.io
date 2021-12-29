---
title: Draw smooth cubic Bessel curves
tags: project
p: project
categories: project
keywords: canvas, smooth Bessel Curve, html draw, draw Bessel Curve, draw curve
mathjax: true
date: 2021-12-26 14:46:10
---
<!-- toc -->

## Basics

What you need to know before reading includes

+ The coordinate system of the canvas
+ The formula for the midpoint of two points in Cartesian coordinates
+ The formula for the distance between two points in Cartesian coordinates
+ Basic trigonometric functions
+ projection basics
+ canvas drawing Bezier curves

## Problems faced
### 1. choosing a quadratic Bezier curve or a cubic Bezier curve

### 2. Calculate control points for Bezier curves

## Problem analysis

### Problem 1.

Since the quadratic Bézier curve will have only one bend after drawing, it will render poorly when multiple nodes are connected. And at 45°, 135°, 225°, 315°, special treatment is needed, otherwise the curve obtained is too large in radian.

### Question 2.

After deciding to use the cubic Bezier curve, we need to calculate the two control points C1,C2 when drawing the curve, and then draw it by `CanvasRenderingContext2D.bezierCurveTo`.

Since we need two control points, we will divide the line **S-E** between the starting point **SP(start point)** and the end point **EP(end point)** into 4 parts. The following points are obtained.

$$
\begin{align*}
Split_{m} = (\frac{(X_{SP}+X_{EP})}2,\frac{(Y_{SP}+Y_{EP})}2)\\
\end{align*}
$$
The formula L(x) for S-E is obtained as
$$
L(x) = \frac{X_{Split_{m}}}{Y_{Slit_{m}}}x
$$
From L(x) we know that the slope of S-E satisfies
$$
\tan \theta = \frac{X_{Split_{m}}}{Y_{Slit_{m}}}
$$

Then, using $$Split_{m}$$ as the origin of the coordinate system and establishing the right angle coordinate system, we get

$$
\begin{align*}
len = \sqrt{(X_{Split_{m}}-X_{SP})^{2}+(Y_{Split_{m}}-Y_{SP})^{2}}\
\\\
\theta = \arctan \frac{X_{Split_{m}}}{Y_{Slit_{m}}}\
\\\\
Y_{offset} = len-\cos \theta \\\\
\\\\
C1=(X_{Split_{m}},Y_{Split_{m}}-len)\\\
C2=(X_{Split_{m}},Y_{Split_{m}}+len)
\end{align*}
$$

## Code section

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