import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Geometry } from "geojson";
import { User } from "modules/users/entities/user.entity";

@Entity()
export class Farm {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column({ unique: true })
  @Index()
  public name: string;

  @Column({ type: "decimal", precision: 5, scale: 1 })
  public size: number;

  @Column({ type: "decimal", precision: 5, scale: 1 })
  public yield: number;

  @Column({ type: "geometry", spatialFeatureType: "Point", srid: 4326 })
  @Index({ spatial: true })
  public coordinates: Geometry;

  @Column()
  public address: string;

  @ManyToOne(() => User, user => user.farms)
  public user: User;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
