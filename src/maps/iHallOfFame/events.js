// iHallOfFame/events.js
// Events for the Hall of Fame

var Warp = require("tpp-warp");

//////////////////////////////// Warps ////////////////////////////////////

add(new Warp({ //warp 00
	id: "EXIT_Surldab",
	locations: [7, 58, 2, 1],
	// exit_to: { map: "xWalkwayLegends", warp: 0 },
}));

add(new Warp({ //warp 01
	id: "EXIT_ToHall01",
	locations: [7, 45, 2, 1],
	exit_to: { warp: 5 },
}));

add(new Warp({ //warp 02
	id: "EXIT_ToHall02",
	locations: [1, 51, 1, 2],
	exit_to: { warp: 4 },
}));

add(new Warp({ //warp 03
	id: "EXIT_ToHall03",
	locations: [14, 51, 1, 2],
	exit_to: { warp: 6 },
}));



add(new Warp({ //warp 04
	id: "EXIT_FromHall02",
	locations: [3, 40, 1, 2],
	exit_to: { warp: 2 },
}));

add(new Warp({ //warp 05
	id: "EXIT_FromHall01",
	locations: [16, 42, 2, 1],
	exit_to: { warp: 1 },
}));

add(new Warp({ //warp 06
	id: "EXIT_FromHall03",
	locations: [30, 40, 1, 2],
	exit_to: { warp: 3 },
}));