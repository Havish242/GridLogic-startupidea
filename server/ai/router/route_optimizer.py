from __future__ import annotations

import math
import random

from ortools.constraint_solver import pywrapcp, routing_enums_pb2


def _distance_km(a_lat: float, a_lng: float, b_lat: float, b_lng: float) -> float:
    return math.sqrt((a_lat - b_lat) ** 2 + (a_lng - b_lng) ** 2) * 111


def optimize_route(engineer_lat: float, engineer_lng: float, site_lat: float, site_lng: float) -> dict:
    points = [(engineer_lat, engineer_lng), (site_lat, site_lng)]
    matrix = [[0, int(_distance_km(*points[0], *points[1]) * 1000)], [int(_distance_km(*points[1], *points[0]) * 1000), 0]]

    manager = pywrapcp.RoutingIndexManager(len(matrix), 1, 0)
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    routing.SolveWithParameters(search_parameters)

    distance_km = matrix[0][1] / 1000
    traffic_factor = random.uniform(1.0, 1.5)
    eta = max(2, round((distance_km / 48) * 60 * traffic_factor))

    polyline = [
        {"lat": engineer_lat, "lng": engineer_lng},
        {"lat": (engineer_lat + site_lat) / 2, "lng": (engineer_lng + site_lng) / 2},
        {"lat": site_lat, "lng": site_lng},
    ]

    return {"polyline": polyline, "eta_minutes": eta}
