from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from ..models import  Opportunity
from ..serializers import (OpportunityCreateSerializer, OpportunitySerializer,  )
from django.core.paginator import Paginator
from rest_framework import status
from django.db import models
from django.db.models import Q


# OPPORTUNITIES

@api_view(['GET'])
@permission_classes([AllowAny])
def opportunity_list(request):
    """
    Get all opportunities with optional filtering and pagination
    """
    try:
        opportunities = Opportunity.objects.filter(is_active=True)
        
        # Type filter
        opportunity_type = request.GET.get('type', None)
        if opportunity_type:
            opportunities = opportunities.filter(type=opportunity_type)
        
        # Search filter
        search = request.GET.get('search', None)
        if search:
            opportunities = opportunities.filter(
                Q(title__icontains=search) |
                Q(organization__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Pagination
        page_size = int(request.GET.get('page_size', 20))
        page = int(request.GET.get('page', 1))
        
        paginator = Paginator(opportunities, page_size)
        page_obj = paginator.get_page(page)
        
        serializer = OpportunitySerializer(page_obj, many=True)
        
        return Response({
            'results': serializer.data,
            'count': paginator.count,
            'next': page_obj.has_next(),
            'previous': page_obj.has_previous(),
            'current_page': page,
            'total_pages': paginator.num_pages
        })
    
    except Exception as e:
        return Response(
            {'error': f'An error occurred: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def opportunity_detail(request, pk):
    """
    Get a single opportunity by ID
    """
    try:
        opportunity = get_object_or_404(Opportunity, pk=pk, is_active=True)
        opportunity.increment_views()
        serializer = OpportunitySerializer(opportunity)
        return Response(serializer.data)
    except Opportunity.DoesNotExist:
        return Response(
            {'error': 'Opportunity not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'An error occurred: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def opportunity_create(request):
    """
    Create a new opportunity (Admin only)
    """
    try:
        serializer = OpportunityCreateSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            opportunity = serializer.save()
            response_serializer = OpportunitySerializer(opportunity)
            return Response(
                response_serializer.data, 
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            serializer.errors, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    except Exception as e:
        return Response(
            {'error': f'An error occurred: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated, IsAdminUser])
def opportunity_update(request, pk):
    """
    Update an opportunity (Admin only)
    """
    try:
        opportunity = get_object_or_404(Opportunity, pk=pk)
        
        partial = request.method == 'PATCH'
        serializer = OpportunityCreateSerializer(
            opportunity, 
            data=request.data, 
            partial=partial,
            context={'request': request}
        )
        
        if serializer.is_valid():
            opportunity = serializer.save()
            response_serializer = OpportunitySerializer(opportunity)
            return Response(response_serializer.data)
        
        return Response(
            serializer.errors, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Opportunity.DoesNotExist:
        return Response(
            {'error': 'Opportunity not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'An error occurred: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def opportunity_delete(request, pk):
    """
    Delete (deactivate) an opportunity (Admin only)
    """
    try:
        opportunity = get_object_or_404(Opportunity, pk=pk)
        opportunity.is_active = False
        opportunity.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Opportunity.DoesNotExist:
        return Response(
            {'error': 'Opportunity not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'An error occurred: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def opportunity_stats(request):
    """
    Get general statistics about opportunities
    """
    try:
        active_opportunities = Opportunity.objects.filter(is_active=True)
        
        total_opportunities = active_opportunities.count()
        total_views = active_opportunities.aggregate(
            total=models.Sum('views')
        )['total'] or 0
        total_applicants = active_opportunities.aggregate(
            total=models.Sum('applicants')
        )['total'] or 0
        
        # Get opportunities by type
        type_stats = {}
        for choice in Opportunity.OPPORTUNITY_TYPES:
            type_key = choice[0]
            type_label = choice[1]
            count = active_opportunities.filter(type=type_key).count()
            if count > 0:  # Only include types with opportunities
                type_stats[type_label] = count
        
        return Response({
            'total_opportunities': total_opportunities,
            'total_views': total_views,
            'total_applicants': total_applicants,
            'opportunities_by_type': type_stats
        })
    
    except Exception as e:
        return Response(
            {'error': f'An error occurred: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
