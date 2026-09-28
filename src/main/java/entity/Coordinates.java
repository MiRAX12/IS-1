package entity;

import java.util.Objects;

public class Coordinates {

    private Long id;

    private Float x; //Значение поля должно быть больше -494, Поле не может быть null

    private Long y; //Значение поля должно быть больше -609, Поле не может быть null

    public Coordinates() {
    }

    public Coordinates(Float x, Long y) {
        this.x = x;
        this.y = y;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Float getX() { return x; }
    public void setX(Float x) { this.x = x; }

    public Long getY() { return y; }
    public void setY(Long y) { this.y = y; }

    @Override
    public String toString() {
        return "Coordinates{" +
                "id=" + id +
                ", x=" + x +
                ", y=" + y +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Coordinates that = (Coordinates) o;
        return Objects.equals(id, that.id) && Objects.equals(x, that.x) && Objects.equals(y, that.y);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, x, y);
    }
}
