import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    PenTool,
    Image,
    Video,
    Heart,
    MessageCircle,
    Share2,
    MapPin,
    Calendar,
    Users,
    TrendingUp,
    Star,
    ThumbsUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/api';

interface TripStory {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    title: string;
    content: string;
    tripRoute: string;
    images: string[];
    tags: string[];
    likes: number;
    comments: number;
    shares: number;
    createdAt: string;
    tripDate: string;
    rating: number;
}

interface ContentStats {
    totalStories: number;
    totalLikes: number;
    totalShares: number;
    activeUsers: number;
}

export const UserGeneratedContent: React.FC = () => {
    const { user } = useAuth();
    const [stories, setStories] = useState<TripStory[]>([]);
    const [stats, setStats] = useState<ContentStats>({
        totalStories: 0,
        totalLikes: 0,
        totalShares: 0,
        activeUsers: 0
    });
    const [isCreating, setIsCreating] = useState(false);
    const [newStory, setNewStory] = useState({
        title: '',
        content: '',
        tripRoute: '',
        tags: '',
        rating: 5
    });

    useEffect(() => {
        loadStories();
        loadStats();
    }, []);

    const loadStories = async () => {
        // Mock user-generated content
        const mockStories: TripStory[] = [
            {
                id: '1',
                authorId: 'user1',
                authorName: 'Ahmed Hassan',
                authorAvatar: '',
                title: 'Incredible Dubai to Abu Dhabi Road Trip',
                content: 'What an amazing journey! The desert scenery was breathtaking, and the new highway made the trip so smooth. We stopped at several amazing viewpoints and tried authentic Emirati food along the way. The Wassel driver was incredibly knowledgeable about local history. Highly recommend this route!',
                tripRoute: 'Dubai → Abu Dhabi',
                images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
                tags: ['desert', 'roadtrip', 'scenic', 'food'],
                likes: 24,
                comments: 8,
                shares: 5,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                tripDate: new Date(Date.now() - 172800000).toISOString(),
                rating: 5
            },
            {
                id: '2',
                authorId: 'user2',
                authorName: 'Priya Sharma',
                authorAvatar: '',
                title: 'Magical Evening in Dubai Marina',
                content: 'Dubai Marina at sunset is pure magic! The views from the Burj Al Arab were spectacular. We took a Wassel ride from the airport and the driver helped us navigate the busy streets. The marina walk was perfect for photos and people-watching. Don\'t miss the Dubai Marina Mall for some amazing shopping!',
                tripRoute: 'Dubai Airport → Dubai Marina',
                images: ['/api/placeholder/400/300'],
                tags: ['sunset', 'marina', 'shopping', 'photos'],
                likes: 31,
                comments: 12,
                shares: 8,
                createdAt: new Date(Date.now() - 43200000).toISOString(),
                tripDate: new Date(Date.now() - 86400000).toISOString(),
                rating: 5
            },
            {
                id: '3',
                authorId: 'user3',
                authorName: 'Mohammed Ali',
                authorAvatar: '',
                title: 'Cultural Journey Through Old Dubai',
                content: 'Exploring the historic sites of Dubai was eye-opening. From the Dubai Museum to the Al Fahidi Historical Neighbourhood, every corner tells a story. Our Wassel driver was passionate about sharing Dubai\'s heritage. The spice souk and gold souk were highlights. A must-do for anyone interested in culture and history.',
                tripRoute: 'Dubai Museum → Spice Souk',
                images: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
                tags: ['culture', 'history', 'museum', 'souks'],
                likes: 18,
                comments: 6,
                shares: 3,
                createdAt: new Date(Date.now() - 21600000).toISOString(),
                tripDate: new Date(Date.now() - 259200000).toISOString(),
                rating: 4
            }
        ];

        setStories(mockStories);
    };

    const loadStats = async () => {
        // Mock content statistics
        setStats({
            totalStories: 1247,
            totalLikes: 8920,
            totalShares: 2156,
            activeUsers: 543
        });
    };

    const createStory = async () => {
        if (!newStory.title || !newStory.content || !newStory.tripRoute) return;

        setIsCreating(true);
        try {
            const story: TripStory = {
                id: Date.now().toString(),
                authorId: user?.id || 'anonymous',
                authorName: user?.user_metadata?.full_name || 'Anonymous User',
                authorAvatar: user?.user_metadata?.avatar_url,
                title: newStory.title,
                content: newStory.content,
                tripRoute: newStory.tripRoute,
                images: [], // Would handle file uploads
                tags: newStory.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                likes: 0,
                comments: 0,
                shares: 0,
                createdAt: new Date().toISOString(),
                tripDate: new Date().toISOString(),
                rating: newStory.rating
            };

            setStories(prev => [story, ...prev]);
            setStats(prev => ({ ...prev, totalStories: prev.totalStories + 1 }));

            // Reset form
            setNewStory({
                title: '',
                content: '',
                tripRoute: '',
                tags: '',
                rating: 5
            });
            setIsCreating(false);

            alert('Story published successfully!');
        } catch (error) {
            console.error('Error creating story:', error);
            alert('Failed to publish story. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const likeStory = async (storyId: string) => {
        setStories(prev => prev.map(story =>
            story.id === storyId
                ? { ...story, likes: story.likes + 1 }
                : story
        ));
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <PenTool className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold">Travel Stories</h1>
                </div>
                <p className="text-muted-foreground">
                    Share your travel experiences and discover amazing journeys from our community
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalStories}</div>
                        <div className="text-sm text-muted-foreground">Stories Shared</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.totalLikes}</div>
                        <div className="text-sm text-muted-foreground">Likes Given</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.totalShares}</div>
                        <div className="text-sm text-muted-foreground">Stories Shared</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.activeUsers}</div>
                        <div className="text-sm text-muted-foreground">Active Travelers</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="feed" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="feed">Community Feed</TabsTrigger>
                    <TabsTrigger value="create">Share Your Story</TabsTrigger>
                    <TabsTrigger value="trending">Trending</TabsTrigger>
                </TabsList>

                {/* Community Feed */}
                <TabsContent value="feed" className="space-y-6">
                    {stories.map((story) => (
                        <Card key={story.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                {/* Author Info */}
                                <div className="flex items-center gap-3 mb-4">
                                    <Avatar>
                                        <AvatarImage src={story.authorAvatar} />
                                        <AvatarFallback>
                                            {story.authorName.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="font-medium">{story.authorName}</div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(story.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < story.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Story Content */}
                                <div className="space-y-3">
                                    <h3 className="text-xl font-semibold">{story.title}</h3>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        {story.tripRoute}
                                    </div>

                                    <p className="text-muted-foreground leading-relaxed">
                                        {story.content}
                                    </p>

                                    {/* Images */}
                                    {story.images.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {story.images.map((image, index) => (
                                                <img
                                                    key={index}
                                                    src={image}
                                                    alt={`Story image ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {story.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex items-center gap-6">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => likeStory(story.id)}
                                                className="flex items-center gap-2"
                                            >
                                                <Heart className="h-4 w-4" />
                                                {story.likes}
                                            </Button>
                                            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                                <MessageCircle className="h-4 w-4" />
                                                {story.comments}
                                            </Button>
                                            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                                <Share2 className="h-4 w-4" />
                                                {story.shares}
                                            </Button>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Read More
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* Create Story */}
                <TabsContent value="create" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Share Your Travel Story</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Story Title</label>
                                <Input
                                    placeholder="Give your story a catchy title"
                                    value={newStory.title}
                                    onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Trip Route</label>
                                <Input
                                    placeholder="e.g., Dubai → Abu Dhabi"
                                    value={newStory.tripRoute}
                                    onChange={(e) => setNewStory(prev => ({ ...prev, tripRoute: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Your Story</label>
                                <Textarea
                                    placeholder="Share your travel experience, tips, and memorable moments..."
                                    rows={6}
                                    value={newStory.content}
                                    onChange={(e) => setNewStory(prev => ({ ...prev, content: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Tags</label>
                                <Input
                                    placeholder="desert, food, adventure (comma-separated)"
                                    value={newStory.tags}
                                    onChange={(e) => setNewStory(prev => ({ ...prev, tags: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Trip Rating</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setNewStory(prev => ({ ...prev, rating: star }))}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                className={`h-6 w-6 ${star <= newStory.rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={createStory}
                                    disabled={isCreating || !newStory.title || !newStory.content}
                                    className="flex-1"
                                >
                                    {isCreating ? 'Publishing...' : 'Publish Story'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setNewStory({
                                        title: '',
                                        content: '',
                                        tripRoute: '',
                                        tags: '',
                                        rating: 5
                                    })}
                                >
                                    Clear
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Trending */}
                <TabsContent value="trending" className="space-y-6">
                    <div className="grid gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Trending Topics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {['desert safari', 'dubai marina', 'gold souk', 'burj khalifa', 'palm jumeirah', 'spice market'].map((topic) => (
                                        <Badge key={topic} variant="outline" className="cursor-pointer hover:bg-blue-50">
                                            #{topic}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Popular Routes This Week</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { route: 'Dubai → Abu Dhabi', stories: 23, trend: 'up' },
                                        { route: 'Dubai Airport → Marina', stories: 18, trend: 'up' },
                                        { route: 'Sharjah → Dubai', stories: 15, trend: 'stable' }
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                                            <div>
                                                <div className="font-medium">{item.route}</div>
                                                <div className="text-sm text-muted-foreground">{item.stories} stories</div>
                                            </div>
                                            <Badge variant={item.trend === 'up' ? 'default' : 'secondary'}>
                                                {item.trend === 'up' ? '↗️ Rising' : '→ Stable'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default UserGeneratedContent;