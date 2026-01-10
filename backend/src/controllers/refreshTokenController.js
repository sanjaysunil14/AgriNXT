import jwt from 'jsonwebtoken';

// Refresh access token using refresh token from cookie
export const refreshAccessToken = async (req, res) => {
    try {
        // Get refresh token from cookie
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        // Generate new access token
        const accessToken = jwt.sign(
            {
                userId: decoded.userId,
                phone_number: decoded.phone_number,
                role: decoded.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '15m' } // 15 minutes
        );

        // Set new access token as HTTP-only cookie
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.status(200).json({
            success: true,
            message: 'Access token refreshed',
            data: {
                accessToken
            }
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token expired'
            });
        }
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Logout and clear refresh token cookie
export const logout = async (req, res) => {
    try {
        // Clear access token cookie
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        // Clear refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
