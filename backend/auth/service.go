package auth

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	secret []byte
}

func NewAuthService() *AuthService {
	return &AuthService{
		secret: []byte(os.Getenv("JWT_SECRET")),
	}
}

func (s *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func (s *AuthService) CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func (s *AuthService) GenerateTokenPair(userID uint) (map[string]string, error) {
	// Access token (15 min expiry)
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  userID,
		"exp":  time.Now().Add(15 * time.Minute).Unix(),
		"type": "access",
	})

	// Refresh token (7 day expiry)
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  userID,
		"exp":  time.Now().Add(7 * 24 * time.Hour).Unix(),
		"type": "refresh",
	})

	accessSigned, err := accessToken.SignedString(s.secret)
	if err != nil {
		return nil, err
	}

	refreshSigned, err := refreshToken.SignedString(s.secret)
	if err != nil {
		return nil, err
	}

	return map[string]string{
		"access_token":  accessSigned,
		"refresh_token": refreshSigned,
	}, nil
}

func (s *AuthService) ValidateToken(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return s.secret, nil
	})
}
