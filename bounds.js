export function mid([minx, miny, minz, maxx, maxy, maxz]) {
    return [
        minx + (maxx - minx) / 2,
        miny + (maxy - miny) / 2,
        minz + (maxz - minz) / 2
    ]
}

export function width(bounds) {
    return bounds[3] - bounds[0]
}
export function depth(bounds) {
    return bounds[4] - bounds[1]
}
export function height(bounds) {
    return bounds[5] - bounds[2]
}

export function step(bounds, [a, b, c]) {
    const [minx, miny, minz, maxx, maxy, maxz] = bounds
    const [midx, midy, midz] = mid(bounds)

    return [
        a ? midx : minx,
        b ? midy : miny,
        c ? midz : minz,
        a ? maxx : midx,
        b ? maxy : midy,
        c ? maxz : midz
    ]
}

export function stepTo(rootBounds, [depth, x, y, z]) {
    let bounds = rootBounds
    for (let i = depth - 1; i >= 0; --i) {
        bounds = step(bounds, [
            (x >> i) & 1,
            (y >> i) & 1,
            (z >> i) & 1,
        ])
    }
    return bounds
}

export function boxify(bounds) {
    const [midx, midy, midz] = mid(bounds)
    const radius = midx - bounds[0]
    return [
        midx, midy, midz,
        radius, 0, 0,
        0, radius, 0,
        0, 0, radius
    ]
}