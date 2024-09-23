const TOKEN = 'ksCR+uAGYbNjIIPNXfwgpa7O2nQsZDYB7OcYb9K0TmCX9DJPe0rT32sDKO+yZmAR';
// all api token use

const accessToken = (req, res, next) => {
    const { token } = req.headers;
    if (token === TOKEN) {
        next(); // Token is valid, proceed to the next middleware or route handler
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

module.exports = accessToken;